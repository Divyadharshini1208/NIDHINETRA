package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.DashboardStatsResponse;
import com.mplads.monitoring.entity.AuditLog;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuditLogService;
import com.mplads.monitoring.service.InsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Role Dashboards", description = "Role-based monitoring and decision support endpoints")
@SecurityRequirement(name = "BearerAuth")
public class DashboardController {

    private final InsightsService insightsService;
    private final AuditLogService auditLogService;

    public DashboardController(InsightsService insightsService, AuditLogService auditLogService) {
        this.insightsService = insightsService;
        this.auditLogService = auditLogService;
    }


    @GetMapping("/stats")
    @Operation(summary = "Get role-tailored dashboard statistics and scoped project queue")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsResponse stats = insightsService.getDashboardStats(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard statistics retrieved", stats));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('MINISTRY_ADMIN')")
    @Operation(summary = "Get system audit logs (Ministry Admin only)")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logPage = auditLogService.getAllLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", logPage.getContent()));
    }
}
