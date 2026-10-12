package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.dto.response.AiMonitoringSummaryResponse;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AiClientService;
import com.mplads.monitoring.service.RiskAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Monitoring & Telemetry", description = "Endpoints for machine learning risk telemetry, duplicate screening, and anomaly detection")
@SecurityRequirement(name = "BearerAuth")
public class AiMonitoringController {

    private final RiskAlertService riskAlertService;
    private final AiClientService aiClientService;

    @GetMapping("/monitoring-summary")
    @Operation(summary = "Get aggregated AI risk distribution and telemetry metrics")
    public ResponseEntity<ApiResponse<AiMonitoringSummaryResponse>> getMonitoringSummary(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AiMonitoringSummaryResponse response = riskAlertService.getMonitoringSummary(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("AI monitoring summary retrieved", response));
    }

    @PostMapping("/analyze-project/{id}")
    @Operation(summary = "Trigger on-demand AI inference and update project risk status")
    public ResponseEntity<ApiResponse<AiAnalysisPreviewResponse>> analyzeProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AiAnalysisPreviewResponse response = riskAlertService.analyzeProjectOnDemand(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project analysis completed successfully", response));
    }

    @PostMapping("/detect-duplicates/{id}")
    @Operation(summary = "Screen project against candidate pool for potential duplicate works")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detectDuplicates(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Map<String, Object> response = riskAlertService.checkDuplicates(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Duplicate work screening completed", response));
    }

    @GetMapping("/health")
    @Operation(summary = "Check FastAPI AI microservice connectivity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiHealth() {
        boolean healthy = aiClientService.isAiServiceHealthy();
        Map<String, Object> data = Map.of(
                "aiServiceConnected", healthy,
                "engine", "Scikit-Learn / Isolation Forest v2.0",
                "mode", healthy ? "LIVE_FASTAPI_INFERENCE" : "EMBEDDED_DETERMINISTIC_FALLBACK"
        );
        return ResponseEntity.ok(ApiResponse.ok("AI Engine Status", data));
    }
}
