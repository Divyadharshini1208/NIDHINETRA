package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.AlertActionRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.PagedResponse;
import com.mplads.monitoring.dto.response.RiskAlertResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.RiskAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Risk Alerts & Investigation", description = "Endpoints for anomaly alerts and multi-tier investigation workflow")
@SecurityRequirement(name = "BearerAuth")
public class AlertController {

    private final RiskAlertService riskAlertService;

    @GetMapping
    @Operation(summary = "Get paginated risk alerts with role-based filtering")
    public ResponseEntity<ApiResponse<PagedResponse<RiskAlertResponse>>> getAlerts(
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String alertType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "detectedAt,desc") String sort,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        String[] sortParts = sort.split(",");
        Sort sortObj = Sort.by(
                sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1]) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortParts[0]
        );
        Pageable pageable = PageRequest.of(page, size, sortObj);

        PagedResponse<RiskAlertResponse> response = riskAlertService.getAlerts(
                severity, alertType, status, stateId, districtId, search, currentUser, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok("Risk alerts retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed risk alert and investigation dossier")
    public ResponseEntity<ApiResponse<RiskAlertResponse>> getAlertById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        RiskAlertResponse response = riskAlertService.getAlertById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Risk alert retrieved", response));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update risk alert investigation status")
    public ResponseEntity<ApiResponse<RiskAlertResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody AlertActionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        RiskAlertResponse response = riskAlertService.updateStatus(id, request.getStatus(), request.getNoteText(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Alert status updated successfully", response));
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign alert to investigator or district planning officer")
    public ResponseEntity<ApiResponse<RiskAlertResponse>> assignAlert(
            @PathVariable Long id,
            @RequestBody AlertActionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        RiskAlertResponse response = riskAlertService.assignAlert(id, request.getAssigneeName(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Alert assigned successfully", response));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Add an official investigation note to alert dossier")
    public ResponseEntity<ApiResponse<RiskAlertResponse>> addNote(
            @PathVariable Long id,
            @RequestBody AlertActionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        RiskAlertResponse response = riskAlertService.addInvestigationNote(id, request.getNoteText(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Investigation note recorded", response));
    }

    @PostMapping("/{id}/escalate")
    @Operation(summary = "Escalate risk alert to CRITICAL priority")
    public ResponseEntity<ApiResponse<RiskAlertResponse>> escalate(
            @PathVariable Long id,
            @RequestBody AlertActionRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        RiskAlertResponse response = riskAlertService.escalateAlert(id, request.getEscalationReason(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Alert escalated to CRITICAL priority", response));
    }
}
