package com.mplads.monitoring.service;

import com.mplads.monitoring.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuditLogService {
    void logAction(String action, String performedBy, String userRole, String details, String ipAddress, String status);
    List<AuditLog> getRecentLogs();
    Page<AuditLog> getAllLogs(Pageable pageable);
}
