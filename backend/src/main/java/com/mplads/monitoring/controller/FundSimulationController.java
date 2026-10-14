package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.SimulationEvaluateRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.SimulationResultResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.FundSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulations")
@Tag(name = "What-If Fund Allocation Simulator", description = "Policy scenario planning without altering statutory accounts")
public class FundSimulationController {

    private final FundSimulationService fundSimulationService;

    public FundSimulationController(FundSimulationService fundSimulationService) {
        this.fundSimulationService = fundSimulationService;
    }

    @PostMapping("/evaluate")
    @Operation(summary = "Evaluate What-If Scenario", description = "Calculate hypothetical impact on project completion, beneficiaries, and timelines")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SimulationResultResponse>> evaluateScenario(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SimulationEvaluateRequest request) {

        SimulationResultResponse result = fundSimulationService.evaluateScenario(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Simulation scenario evaluated", result));
    }

    @PostMapping("/save")
    @Operation(summary = "Save What-If Scenario", description = "Persist evaluated scenario for administrative discussion and reporting")
    @PreAuthorize("hasAnyRole('MP', 'DISTRICT_AUTHORITY', 'STATE_NODAL_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<SimulationResultResponse>> saveScenario(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody SimulationEvaluateRequest request) {

        SimulationResultResponse result = fundSimulationService.saveScenario(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Simulation scenario saved successfully", result));
    }

    @GetMapping
    @Operation(summary = "Get Saved Scenarios", description = "Lists saved simulation scenarios created by or accessible to user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<SimulationResultResponse>>> getSavedScenarios(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<SimulationResultResponse> list = fundSimulationService.getSavedScenarios(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Saved scenarios retrieved", list));
    }
}
