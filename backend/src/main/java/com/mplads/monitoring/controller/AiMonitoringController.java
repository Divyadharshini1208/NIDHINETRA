package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.dto.response.AiMonitoringSummaryResponse;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.service.AiClientService;
import com.mplads.monitoring.service.RiskAlertService;
import com.mplads.monitoring.entity.Project;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Monitoring & Telemetry", description = "Endpoints for machine learning risk telemetry, duplicate screening, and anomaly detection")
@SecurityRequirement(name = "BearerAuth")
public class AiMonitoringController {

    private final RiskAlertService riskAlertService;
    private final AiClientService aiClientService;
    private final ProjectRepository projectRepository;

    public AiMonitoringController(
            RiskAlertService riskAlertService,
            AiClientService aiClientService,
            ProjectRepository projectRepository
    ) {
        this.riskAlertService = riskAlertService;
        this.aiClientService = aiClientService;
        this.projectRepository = projectRepository;
    }

    @GetMapping("/monitoring-summary")
    @Operation(summary = "Get aggregated AI risk distribution and telemetry metrics")
    public ResponseEntity<ApiResponse<AiMonitoringSummaryResponse>> getMonitoringSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiMonitoringSummaryResponse response = riskAlertService.getMonitoringSummary(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("AI monitoring summary retrieved", response));
    }

    @PostMapping("/analyze-project/{id}")
    @Operation(summary = "Trigger on-demand AI inference and update project risk status")
    public ResponseEntity<ApiResponse<AiAnalysisPreviewResponse>> analyzeProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        AiAnalysisPreviewResponse response = riskAlertService.analyzeProjectOnDemand(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project analysis completed successfully", response));
    }

    @PostMapping("/detect-duplicates/{id}")
    @Operation(summary = "Screen project against candidate pool for potential duplicate works")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detectDuplicates(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> response = riskAlertService.checkDuplicates(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Duplicate work screening completed", response));
    }

    @GetMapping("/health")
    @Operation(summary = "Check FastAPI AI microservice connectivity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiHealth() {
        boolean healthy = aiClientService.isAiServiceHealthy();
        Map<String, Object> data = Map.of(
                "aiServiceConnected", healthy,
                "engine", "Scikit-Learn / Isolation Forest v2.1",
                "mode", healthy ? "LIVE_FASTAPI_INFERENCE" : "EMBEDDED_DETERMINISTIC_FALLBACK");
        return ResponseEntity.ok(ApiResponse.ok("AI Engine Status", data));
    }

    @PostMapping("/query")
    @Operation(summary = "Ask natural-language question grounded strictly in verified scheme records")
    public ResponseEntity<ApiResponse<Map<String, Object>>> querySchemeData(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String query = (String) request.getOrDefault("query", "");
        List<Project> scoped;
        if ("ROLE_STATE_NODAL_AUTHORITY".equals(currentUser.getRole()) && currentUser.getStateId() != null) {
            scoped = projectRepository.findByStateId(currentUser.getStateId());
        } else if ("ROLE_DISTRICT_AUTHORITY".equals(currentUser.getRole()) && currentUser.getDistrictId() != null) {
            scoped = projectRepository.findByDistrictId(currentUser.getDistrictId());
        } else if ("ROLE_MP".equals(currentUser.getRole()) && currentUser.getConstituencyId() != null) {
            scoped = projectRepository.findByConstituencyId(currentUser.getConstituencyId());
        } else {
            scoped = projectRepository.findAll();
        }

        Map<String, Object> result = aiClientService.queryGroundedAnalytics(query, scoped);
        return ResponseEntity.ok(ApiResponse.ok("Grounded analytics response generated", result));
    }

    @GetMapping("/models/status")
    @Operation(summary = "Get operational status of Scikit-Learn and PyTorch models")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiModelsStatus() {
        Map<String, Object> status = aiClientService.getAiModelsStatus();
        return ResponseEntity.ok(ApiResponse.ok("AI model status retrieved", status));
    }

    @GetMapping("/models/compare")
    @Operation(summary = "Empirical benchmark comparison between Scikit-Learn baseline and PyTorch autoencoder")
    public ResponseEntity<ApiResponse<Map<String, Object>>> compareAiModels() {
        Map<String, Object> comparison = aiClientService.compareAiModels();
        return ResponseEntity.ok(ApiResponse.ok("Model comparison benchmark retrieved", comparison));
    }

    @PostMapping("/analyze-pytorch/{id}")
    @Operation(summary = "Evaluate tabular reconstruction anomaly score via PyTorch Autoencoder")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analyzePyTorch(@PathVariable Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new com.mplads.monitoring.exception.ResourceNotFoundException("Project", "id", id));
        Map<String, Object> result = aiClientService.evaluatePyTorch(project);
        return ResponseEntity.ok(ApiResponse.ok("PyTorch evaluation completed", result));
    }
}
