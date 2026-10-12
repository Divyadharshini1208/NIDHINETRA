package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.InsightsSummaryResponse;
import com.mplads.monitoring.service.InsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/insights")
@RequiredArgsConstructor
@Tag(name = "Public Insights & Analytics", description = "Public statistics, progress trends, and geographic distributions")
public class PublicInsightsController {

    private final InsightsService insightsService;

    @GetMapping("/summary")
    @Operation(summary = "Get high-level aggregated public monitoring summary metrics")
    public ResponseEntity<ApiResponse<InsightsSummaryResponse>> getSummary() {
        InsightsSummaryResponse summary = insightsService.getPublicInsightsSummary();
        return ResponseEntity.ok(ApiResponse.ok("Public insights summary retrieved", summary));
    }

    @GetMapping("/states")
    @Operation(summary = "Get state-wise financial and project distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStateInsights() {
        List<Map<String, Object>> stateData = insightsService.getStateWiseInsights();
        return ResponseEntity.ok(ApiResponse.ok("State-wise insights retrieved", stateData));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get sector-wise project distribution")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategoryInsights() {
        List<Map<String, Object>> categoryData = insightsService.getCategoryDistribution();
        return ResponseEntity.ok(ApiResponse.ok("Category distribution retrieved", categoryData));
    }
}
