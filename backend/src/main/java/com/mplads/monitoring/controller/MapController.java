package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.ProjectResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.MapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@Tag(name = "GIS & Mapping", description = "GIS spatial endpoints for Leaflet map integration")
@SecurityRequirement(name = "BearerAuth")
public class MapController {

    private final MapService mapService;

    @GetMapping("/projects")
    @Operation(summary = "Get geotagged projects for map rendering with role-scoped filters")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMapProjects(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String category
    ) {
        List<ProjectResponse> response = mapService.getMapProjects(currentUser, stateId, districtId, status, riskLevel, category);
        return ResponseEntity.ok(ApiResponse.ok("Map projects retrieved", response));
    }
}
