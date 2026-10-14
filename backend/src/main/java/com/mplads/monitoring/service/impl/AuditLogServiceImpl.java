package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.entity.AuditLog;
import com.mplads.monitoring.repository.AuditLogRepository;
import com.mplads.monitoring.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }


    @Override
    @Transactional
    public void logAction(String action, String performedBy, String userRole, String details, String ipAddress, String status) {
        try {
            AuditLog logEntry = AuditLog.builder()
                    .action(action)
                    .performedBy(performedBy != null ? performedBy : "ANONYMOUS")
                    .userRole(userRole != null ? userRole : "NONE")
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .status(status != null ? status : "SUCCESS")
                    .build();

            auditLogRepository.save(logEntry);
            log.info("Audit log saved: action={}, user={}, status={}", action, performedBy, status);
        } catch (Exception ex) {
            log.error("Failed to save audit log: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop20ByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
