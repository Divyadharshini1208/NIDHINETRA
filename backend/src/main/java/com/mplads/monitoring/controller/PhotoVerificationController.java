package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.PhotoVerificationResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.PhotoVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Geofenced Evidence Verification", description = "GPS metadata and photo evidence verification against sanctioned works")
public class PhotoVerificationController {

    private final PhotoVerificationService photoVerificationService;

    public PhotoVerificationController(PhotoVerificationService photoVerificationService) {
        this.photoVerificationService = photoVerificationService;
    }


    @PostMapping(value = "/{id}/verify-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Verify site inspection photo", description = "Verifies GPS coordinates, Haversine distance, and image hash against approved project location")
    @PreAuthorize("hasAnyRole('DISTRICT_AUTHORITY', 'STATE_NODAL_AUTHORITY', 'MINISTRY_ADMIN')")
    public ResponseEntity<ApiResponse<PhotoVerificationResponse>> verifyPhoto(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude) {

        PhotoVerificationResponse response = photoVerificationService.verifyProjectPhoto(
                currentUser, id, file, latitude, longitude
        );
        return ResponseEntity.ok(ApiResponse.success("Photo geofence verification completed", response));
    }

    @GetMapping("/{id}/photo-verifications")
    @Operation(summary = "Get photo verification history", description = "Lists all geofence verification audit outcomes for a project")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<PhotoVerificationResponse>>> getPhotoVerifications(
            @PathVariable Long id) {

        List<PhotoVerificationResponse> list = photoVerificationService.getVerificationsByProject(id);
        return ResponseEntity.ok(ApiResponse.success("Photo verifications retrieved", list));
    }
}
