package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.ReportPreviewResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Analytics", description = "Endpoints for generating structured reports and export previews")
@SecurityRequirement(name = "BearerAuth")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }


    @GetMapping("/preview")
    @Operation(summary = "Generate structured report preview table and metrics")
    public ResponseEntity<ApiResponse<ReportPreviewResponse>> generateReportPreview(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "PROJECT_SUMMARY") String reportType,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        ReportPreviewResponse response = reportService.generateReportPreview(reportType, stateId, districtId, fromDate, toDate, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Report preview generated successfully", response));
    }
}
