package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.RiskNotificationResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.RiskNotification;
import com.mplads.monitoring.repository.RiskNotificationRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    private final RiskNotificationRepository notificationRepository;

    public NotificationServiceImpl(RiskNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }


    public record SseClient(Long userId, String role, Long stateId, Long districtId, SseEmitter emitter) {}

    // Active SSE client connections with user authority context
    private final List<SseClient> activeClients = new CopyOnWriteArrayList<>();

    @Override
    public SseEmitter createSseEmitter(UserPrincipal user) {
        // 5-minute timeout for SSE emitter
        SseEmitter emitter = new SseEmitter(300_000L);
        SseClient client = new SseClient(user.getId(), user.getRole(), user.getStateId(), user.getDistrictId(), emitter);

        activeClients.add(client);

        emitter.onCompletion(() -> activeClients.remove(client));
        emitter.onTimeout(() -> activeClients.remove(client));
        emitter.onError(e -> activeClients.remove(client));

        // Send initial connection handshake event
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("NIDHINETRA Real-Time SSE Stream established for " + user.getUsername()));
        } catch (IOException e) {
            activeClients.remove(client);
        }

        return emitter;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RiskNotificationResponse> getNotifications(UserPrincipal user, Pageable pageable) {
        Long stateId = "ROLE_MINISTRY_ADMIN".equals(user.getRole()) ? null : user.getStateId();
        Long districtId = "ROLE_DISTRICT_AUTHORITY".equals(user.getRole()) ? user.getDistrictId() : null;

        return notificationRepository.findScopedNotifications(stateId, districtId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UserPrincipal user) {
        Long stateId = "ROLE_MINISTRY_ADMIN".equals(user.getRole()) ? null : user.getStateId();
        Long districtId = "ROLE_DISTRICT_AUTHORITY".equals(user.getRole()) ? user.getDistrictId() : null;

        return notificationRepository.countUnread(stateId, districtId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(UserPrincipal user) {
        Long stateId = "ROLE_MINISTRY_ADMIN".equals(user.getRole()) ? null : user.getStateId();
        Long districtId = "ROLE_DISTRICT_AUTHORITY".equals(user.getRole()) ? user.getDistrictId() : null;

        notificationRepository.markAllReadScoped(stateId, districtId);
    }

    @Override
    @Transactional
    public void evaluateProjectRiskAndNotify(Project project) {
        double physical = project.getPhysicalProgress() != null ? project.getPhysicalProgress().doubleValue() : 0.0;
        double financial = project.getFinancialProgress() != null ? project.getFinancialProgress() : 0.0;
        int delay = project.getDelayDays() != null ? project.getDelayDays() : 0;
        double riskScore = project.getRiskScore() != null ? project.getRiskScore() : 10.0;

        String severity = null;
        String triggerRule = null;
        String title = null;
        String message = null;

        // Rule 1: Fund utilization >= 90% with physical completion <= 10%
        if (financial >= 90.0 && physical <= 10.0) {
            severity = "CRITICAL";
            triggerRule = "PROGRESS_MISMATCH_GAP_90_10";
            title = "Severe Progress-Financial Mismatch Flagged";
            message = String.format("Project %s has drawn %.1f%% of sanctioned funds while certified physical completion is only %.1f%%.",
                    project.getProjectId(), financial, physical);
        }
        // Rule 2: Overdue > 180 days with expenditure >= 60%
        else if (delay >= 180 && financial >= 60.0) {
            severity = "HIGH";
            triggerRule = "SEVERE_DELAY_HIGH_EXPENDITURE";
            title = "Critical Project Timeline Overrun";
            message = String.format("Project %s is delayed by %d days with %.1f%% funds disbursed. Immediate site verification advised.",
                    project.getProjectId(), delay, financial);
        }
        // Rule 3: IsolationForest Anomaly Score >= 80.0
        else if (riskScore >= 80.0) {
            severity = "CRITICAL";
            triggerRule = "HIGH_ANOMALY_SCORE";
            title = "AI Model High Statistical Outlier Isolated";
            message = String.format("Project %s isolated as statistical outlier with anomaly score %.1f/100 by IsolationForest engine.",
                    project.getProjectId(), riskScore);
        }

        if (severity != null) {
            // Flood Protection: Prevent duplicate alert generation within 24 hours for the same project and rule
            boolean alreadyNotifiedRecently = notificationRepository.existsByProjectIdAndTriggerRuleAndCreatedAtAfter(
                    project.getId(), triggerRule, java.time.LocalDateTime.now().minusHours(24)
            );
            if (alreadyNotifiedRecently) {
                log.info("Flood Protection: Alert for project {} rule {} already issued within 24 hours.", 
                        project.getProjectId(), triggerRule);
                return;
            }

            Long stateId = project.getState() != null ? project.getState().getId() : null;
            Long districtId = project.getDistrict() != null ? project.getDistrict().getId() : null;

            RiskNotification notification = RiskNotification.builder()
                    .projectId(project.getId())
                    .projectCode(project.getProjectId())
                    .projectName(project.getProjectName())
                    .title(title)
                    .message(message)
                    .severity(severity)
                    .triggerRule(triggerRule)
                    .stateId(stateId)
                    .districtId(districtId)
                    .isRead(false)
                    .build();

            RiskNotification saved = notificationRepository.save(notification);
            broadcastSseNotification(saved);
        }
    }

    private void broadcastSseNotification(RiskNotification notification) {
        RiskNotificationResponse dto = mapToResponse(notification);

        activeClients.removeIf(client -> {
            boolean authorized = false;
            String role = client.role();

            if ("ROLE_MINISTRY_ADMIN".equals(role)) {
                authorized = true;
            } else if ("ROLE_STATE_NODAL_AUTHORITY".equals(role)) {
                authorized = notification.getStateId() == null || notification.getStateId().equals(client.stateId());
            } else if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
                authorized = notification.getDistrictId() == null || notification.getDistrictId().equals(client.districtId());
            } else if ("ROLE_MP".equals(role)) {
                authorized = notification.getDistrictId() == null || notification.getDistrictId().equals(client.districtId());
            }

            if (!authorized) {
                return false;
            }

            try {
                client.emitter().send(SseEmitter.event()
                        .name("RISK_ALERT")
                        .data(dto));
                return false;
            } catch (Exception e) {
                return true; // remove disconnected emitter
            }
        });
    }

    private RiskNotificationResponse mapToResponse(RiskNotification n) {
        return RiskNotificationResponse.builder()
                .id(n.getId())
                .projectId(n.getProjectId())
                .projectCode(n.getProjectCode())
                .projectName(n.getProjectName())
                .title(n.getTitle())
                .message(n.getMessage())
                .severity(n.getSeverity())
                .triggerRule(n.getTriggerRule())
                .stateId(n.getStateId())
                .districtId(n.getDistrictId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
