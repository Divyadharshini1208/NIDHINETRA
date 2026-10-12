package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.LocationDto;
import com.mplads.monitoring.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@Tag(name = "Administrative Geography", description = "Endpoints for fetching Indian States, Districts, and Constituencies")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/states")
    @Operation(summary = "Get all States and Union Territories")
    public ResponseEntity<ApiResponse<List<LocationDto.StateDto>>> getAllStates() {
        List<LocationDto.StateDto> states = locationService.getAllStates();
        return ResponseEntity.ok(ApiResponse.ok("States retrieved successfully", states));
    }

    @GetMapping("/states/{stateId}/districts")
    @Operation(summary = "Get all Districts in a State")
    public ResponseEntity<ApiResponse<List<LocationDto.DistrictDto>>> getDistrictsByState(
            @PathVariable Long stateId) {
        List<LocationDto.DistrictDto> districts = locationService.getDistrictsByState(stateId);
        return ResponseEntity.ok(ApiResponse.ok("Districts retrieved successfully", districts));
    }

    @GetMapping("/districts/{districtId}/constituencies")
    @Operation(summary = "Get all Parliamentary Constituencies in a District")
    public ResponseEntity<ApiResponse<List<LocationDto.ConstituencyDto>>> getConstituenciesByDistrict(
            @PathVariable Long districtId) {
        List<LocationDto.ConstituencyDto> constituencies = locationService.getConstituenciesByDistrict(districtId);
        return ResponseEntity.ok(ApiResponse.ok("Constituencies retrieved successfully", constituencies));
    }
}
