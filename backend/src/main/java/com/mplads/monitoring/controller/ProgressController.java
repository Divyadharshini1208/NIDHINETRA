package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.ProjectProgressRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.ProjectProgressResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@Tag(name = "Progress Monitoring", description = "Endpoints for tracking physical and financial project execution milestones")
@SecurityRequirement(name = "BearerAuth")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }


    @GetMapping("/{projectId}")
    @Operation(summary = "Get physical progress timeline for a project")
    public ResponseEntity<ApiResponse<List<ProjectProgressResponse>>> getProgress(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<ProjectProgressResponse> response = progressService.getProjectProgressLogs(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Progress records retrieved", response));
    }

    @PostMapping("/record")
    @Operation(summary = "Record new physical milestone inspection and delay assessment")
    public ResponseEntity<ApiResponse<ProjectProgressResponse>> recordProgress(
            @Valid @RequestBody ProjectProgressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectProgressResponse response = progressService.recordProgress(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Progress record saved", response), HttpStatus.CREATED);
    }
}
