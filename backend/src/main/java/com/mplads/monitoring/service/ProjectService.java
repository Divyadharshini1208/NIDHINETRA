package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.dto.response.PagedResponse;
import com.mplads.monitoring.dto.response.ProjectResponse;
import com.mplads.monitoring.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface ProjectService {

    PagedResponse<ProjectResponse> getProjects(
            UserPrincipal currentUser,
            Long stateId,
            Long districtId,
            Long constituencyId,
            String mpName,
            String status,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String riskLevel,
            String search,
            Pageable pageable
    );

    ProjectResponse getProjectById(Long id, UserPrincipal currentUser);

    ProjectResponse createProject(ProjectRequest request, UserPrincipal currentUser);

    ProjectResponse updateProject(Long id, ProjectRequest request, UserPrincipal currentUser);

    ProjectResponse reviewProject(Long id, com.mplads.monitoring.dto.request.ProjectReviewRequest request, UserPrincipal currentUser);

    java.util.List<com.mplads.monitoring.entity.ProjectCategory> getCategories();

    void deleteProject(Long id, UserPrincipal currentUser);

    AiAnalysisPreviewResponse getAiAnalysis(Long id, UserPrincipal currentUser);
}
