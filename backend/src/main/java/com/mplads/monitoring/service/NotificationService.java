package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.RiskNotificationResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface NotificationService {

    SseEmitter createSseEmitter(UserPrincipal user);

    Page<RiskNotificationResponse> getNotifications(UserPrincipal user, Pageable pageable);

    long getUnreadCount(UserPrincipal user);

    void markAsRead(Long notificationId);

    void markAllAsRead(UserPrincipal user);

    void evaluateProjectRiskAndNotify(Project project);
}
