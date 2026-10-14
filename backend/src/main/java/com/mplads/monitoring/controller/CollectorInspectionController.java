package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.AssignInspectionRequest;
import com.mplads.monitoring.dto.request.InspectionOutcomeRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.InspectionQueueItemResponse;
import com.mplads.monitoring.dto.response.WeeklyInspectionSummaryResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.CollectorInspectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/collector")
@Tag(name = "Collector Inspection Queue", description = "AI-Powered inspection prioritization and tracking for district officials")
public class CollectorInspectionController {

    private final CollectorInspectionService collectorInspectionService;

    public CollectorInspectionController(CollectorInspectionService collectorInspectionService) {
        this.collectorInspectionService = collectorInspectionService;
    }


    @GetMapping("/inspection-queue")
    @Operation(summary = "Get prioritized inspection queue", description = "Returns high-risk projects ranked for on-ground physical inspection")
    @PreAuthorize("hasAnyRole('DISTRICT_AUTHORITY', 'STATE_NODAL_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<Page<InspectionQueueItemResponse>>> getInspectionQueue(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long districtId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<InspectionQueueItemResponse> queue = collectorInspectionService.getInspectionQueue(currentUser, districtId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Inspection queue retrieved successfully", queue));
    }

    @PostMapping("/assign-inspection")
    @Operation(summary = "Assign on-site inspection", description = "Assign an inspection officer and timeline for a flagged work")
    @PreAuthorize("hasAnyRole('DISTRICT_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<InspectionQueueItemResponse>> assignInspection(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody AssignInspectionRequest request) {

        InspectionQueueItemResponse response = collectorInspectionService.assignInspection(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Inspection assigned successfully", response));
    }

    @PostMapping("/inspection-outcome")
    @Operation(summary = "Record inspection outcome", description = "Submit certified site inspection findings and outcomes")
    @PreAuthorize("hasAnyRole('DISTRICT_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<InspectionQueueItemResponse>> recordInspectionOutcome(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody InspectionOutcomeRequest request) {

        InspectionQueueItemResponse response = collectorInspectionService.recordInspectionOutcome(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Inspection outcome recorded successfully", response));
    }

    @GetMapping("/weekly-summary")
    @Operation(summary = "Get weekly inspection summary", description = "Returns weekly district inspection throughput and compliance statistics")
    @PreAuthorize("hasAnyRole('DISTRICT_AUTHORITY', 'STATE_NODAL_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<WeeklyInspectionSummaryResponse>> getWeeklySummary(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long districtId) {

        WeeklyInspectionSummaryResponse summary = collectorInspectionService.getWeeklySummary(currentUser, districtId);
        return ResponseEntity.ok(ApiResponse.success("Weekly inspection summary retrieved", summary));
    }
}
