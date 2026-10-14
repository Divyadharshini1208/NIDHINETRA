package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.AgencyReliabilityResponse;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.service.AgencyAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics/agencies")
@Tag(name = "Agency Reliability Analytics", description = "Historical performance and reliability indices for implementing agencies")
public class AgencyAnalyticsController {

    private final AgencyAnalyticsService agencyAnalyticsService;

    public AgencyAnalyticsController(AgencyAnalyticsService agencyAnalyticsService) {
        this.agencyAnalyticsService = agencyAnalyticsService;
    }


    @GetMapping
    @Operation(summary = "Get agency reliability leaderboard", description = "Lists implementing agencies ranked by delivery reliability score and performance bands (A+, A, B, C)")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AgencyReliabilityResponse>>> getLeaderboard() {
        List<AgencyReliabilityResponse> leaderboard = agencyAnalyticsService.getAgencyReliabilityLeaderboard();
        return ResponseEntity.ok(ApiResponse.success("Agency reliability leaderboard retrieved", leaderboard));
    }

    @GetMapping("/{agencyName}")
    @Operation(summary = "Get specific agency performance", description = "Returns deep-dive indicator contributions and metrics for a designated agency")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AgencyReliabilityResponse>> getAgencyDetails(@PathVariable String agencyName) {
        AgencyReliabilityResponse details = agencyAnalyticsService.getAgencyDetails(agencyName);
        return ResponseEntity.ok(ApiResponse.success("Agency profile retrieved", details));
    }
}
