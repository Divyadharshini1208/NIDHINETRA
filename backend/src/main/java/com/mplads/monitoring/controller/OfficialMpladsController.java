package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.OfficialMpladsDataResponse;
import com.mplads.monitoring.service.OfficialMpladsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/official-data")
@Tag(name = "Official MoSPI Data Integration", description = "Endpoints for live official MPLADS telemetry from mplads.mospi.gov.in")
public class OfficialMpladsController {

    private final OfficialMpladsService officialMpladsService;

    public OfficialMpladsController(OfficialMpladsService officialMpladsService) {
        this.officialMpladsService = officialMpladsService;
    }


    @GetMapping("/summary")
    @Operation(summary = "Get official macro telemetry directly from MoSPI eSAKSHI portal")
    public ResponseEntity<ApiResponse<OfficialMpladsDataResponse>> getOfficialTelemetry() {
        OfficialMpladsDataResponse response = officialMpladsService.getOfficialTelemetrySummary();
        return ResponseEntity.ok(ApiResponse.ok("Official MoSPI telemetry retrieved successfully", response));
    }

    @GetMapping("/states")
    @Operation(summary = "Get list of official states from MoSPI registry")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOfficialStates() {
        List<Map<String, Object>> states = officialMpladsService.getOfficialStates();
        return ResponseEntity.ok(ApiResponse.ok("Official states retrieved", states));
    }

    @PostMapping("/sync")
    @Operation(summary = "Force refresh telemetry from official MoSPI eSAKSHI servers")
    public ResponseEntity<ApiResponse<OfficialMpladsDataResponse>> syncTelemetry() {
        OfficialMpladsDataResponse response = officialMpladsService.refreshOfficialTelemetry();
        return ResponseEntity.ok(ApiResponse.ok("Official MoSPI telemetry synchronized", response));
    }
}
