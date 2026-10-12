package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.ProjectProgressRequest;
import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.request.ProjectReviewRequest;
import com.mplads.monitoring.dto.response.*;
import com.mplads.monitoring.entity.ProjectCategory;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.FinancialService;
import com.mplads.monitoring.service.ProgressService;
import com.mplads.monitoring.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project Management", description = "REST APIs for MPLADS projects, life-cycle monitoring, and details")
@SecurityRequirement(name = "BearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final FinancialService financialService;
    private final ProgressService progressService;

    @GetMapping
    @Operation(summary = "Get paginated projects with role-based filtering and multi-parameter filters")
    public ResponseEntity<ApiResponse<PagedResponse<ProjectResponse>>> getProjects(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) Long stateId,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long constituencyId,
            @RequestParam(required = false) String mpName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && "asc".equalsIgnoreCase(sortParams[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        PagedResponse<ProjectResponse> response = projectService.getProjects(
                currentUser, stateId, districtId, constituencyId, mpName, status, category, startDate, endDate, riskLevel, search, pageable
        );

        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single project by ID with full metadata and role authorization")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectResponse response = projectService.getProjectById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project details retrieved successfully", response));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all official MPLADS project work categories")
    public ResponseEntity<ApiResponse<List<ProjectCategory>>> getCategories() {
        List<ProjectCategory> categories = projectService.getCategories();
        return ResponseEntity.ok(ApiResponse.ok("Project categories retrieved", categories));
    }

    @PostMapping
    @Operation(summary = "Create a new MPLADS project record")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectResponse response = projectService.createProject(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Project created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing MPLADS project record")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectResponse response = projectService.updateProject(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @PutMapping("/{id}/review")
    @Operation(summary = "Review, perform feasibility assessment, sanction or reject a submitted MPLADS project")
    public ResponseEntity<ApiResponse<ProjectResponse>> reviewProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectResponse response = projectService.reviewProject(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project review processed successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MINISTRY_ADMIN')")
    @Operation(summary = "Delete an MPLADS project record (Ministry Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }

    @GetMapping("/{id}/financials")
    @Operation(summary = "Get full financial breakdown, sanctions, releases, expenditures, and payments for a project")
    public ResponseEntity<ApiResponse<ProjectFinancialsResponse>> getProjectFinancials(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ProjectFinancialsResponse response = financialService.getProjectFinancials(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project financials retrieved successfully", response));
    }

    @GetMapping("/{id}/progress")
    @Operation(summary = "Get physical and milestone progress logs for a project")
    public ResponseEntity<ApiResponse<List<ProjectProgressResponse>>> getProjectProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<ProjectProgressResponse> response = progressService.getProjectProgressLogs(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project progress history retrieved", response));
    }

    @PostMapping("/{id}/progress")
    @Operation(summary = "Record new physical milestone and progress log for a project")
    public ResponseEntity<ApiResponse<ProjectProgressResponse>> recordProgress(
            @PathVariable Long id,
            @Valid @RequestBody ProjectProgressRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        request.setProjectId(id);
        ProjectProgressResponse response = progressService.recordProgress(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Progress recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/documents")
    @Operation(summary = "Get uploaded sanction letters, UCs, and site inspection documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getProjectDocuments(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<DocumentResponse> response = progressService.getProjectDocuments(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project documents retrieved", response));
    }

    @GetMapping("/{id}/alerts")
    @Operation(summary = "Get risk alerts and anomaly flags associated with a project")
    public ResponseEntity<ApiResponse<List<RiskAlertResponse>>> getProjectAlerts(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<RiskAlertResponse> response = progressService.getProjectRiskAlerts(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Project risk alerts retrieved", response));
    }

    @GetMapping("/{id}/ai-analysis")
    @Operation(summary = "Get prepared AI Risk and Anomaly analysis preview for project")
    public ResponseEntity<ApiResponse<AiAnalysisPreviewResponse>> getAiAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AiAnalysisPreviewResponse response = projectService.getAiAnalysis(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("AI analysis retrieved", response));
    }
}
