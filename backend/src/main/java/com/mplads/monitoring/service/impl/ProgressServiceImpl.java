package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.request.ProjectProgressRequest;
import com.mplads.monitoring.dto.response.DocumentResponse;
import com.mplads.monitoring.dto.response.ProjectProgressResponse;
import com.mplads.monitoring.dto.response.RiskAlertResponse;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.exception.AppException;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.repository.DocumentRepository;
import com.mplads.monitoring.repository.ProjectProgressRepository;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.repository.RiskAlertRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.ProgressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProgressServiceImpl implements ProgressService {

    private final ProjectRepository projectRepository;
    private final ProjectProgressRepository progressRepository;
    private final DocumentRepository documentRepository;
    private final RiskAlertRepository riskAlertRepository;

    public ProgressServiceImpl(
            ProjectRepository projectRepository,
            ProjectProgressRepository progressRepository,
            DocumentRepository documentRepository,
            RiskAlertRepository riskAlertRepository) {
        this.projectRepository = projectRepository;
        this.progressRepository = progressRepository;
        this.documentRepository = documentRepository;
        this.riskAlertRepository = riskAlertRepository;
    }


    @Override
    @Transactional(readOnly = true)
    public List<ProjectProgressResponse> getProjectProgressLogs(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        verifyProjectAccess(project, currentUser);

        return progressRepository.findByProjectIdOrderByReportingDateDesc(projectId).stream()
                .map(this::mapProgress)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectProgressResponse recordProgress(ProjectProgressRequest request, UserPrincipal currentUser) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
        verifyProjectAccess(project, currentUser);

        int delay = calculateDelay(project, request.getReportingDate());
        boolean isDelayed = delay > 0;

        ProjectProgress progress = ProjectProgress.builder()
                .project(project)
                .reportingDate(request.getReportingDate())
                .physicalProgressPercent(request.getPhysicalProgressPercent())
                .financialProgressPercent(request.getFinancialProgressPercent() != null ? request.getFinancialProgressPercent() : project.getFinancialProgress())
                .stageDescription(request.getStageDescription())
                .inspectionNotes(request.getInspectionNotes())
                .reportedBy(request.getReportedBy() != null ? request.getReportedBy() : currentUser.getFullName())
                .delayDays(delay)
                .isDelayed(isDelayed)
                .delayReason(request.getDelayReason())
                .build();

        ProjectProgress saved = progressRepository.save(progress);

        // Update main project physical progress and status
        project.setPhysicalProgress(request.getPhysicalProgressPercent());
        project.setDelayDays(delay);
        if (request.getPhysicalProgressPercent() >= 100) {
            project.setStatus(ProjectStatus.COMPLETED);
            project.setActualCompletionDate(request.getReportingDate());
        } else if (isDelayed) {
            project.setStatus(ProjectStatus.DELAYED);
        } else {
            project.setStatus(ProjectStatus.ONGOING);
        }
        projectRepository.save(project);

        return mapProgress(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getProjectDocuments(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        verifyProjectAccess(project, currentUser);

        return documentRepository.findByProjectIdOrderByUploadedAtDesc(projectId).stream()
                .map(d -> DocumentResponse.builder()
                        .id(d.getId())
                        .projectId(project.getId())
                        .projectCode(project.getProjectId())
                        .documentType(d.getDocumentType())
                        .fileName(d.getFileName())
                        .fileUrl(d.getFileUrl())
                        .fileSize(d.getFileSize())
                        .uploadedBy(d.getUploadedBy())
                        .uploadedAt(d.getUploadedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskAlertResponse> getProjectRiskAlerts(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        verifyProjectAccess(project, currentUser);

        return riskAlertRepository.findByProjectId(projectId).stream()
                .map(r -> RiskAlertResponse.builder()
                        .id(r.getId())
                        .projectId(project.getId())
                        .projectCode(project.getProjectId())
                        .projectName(project.getProjectName())
                        .alertType(r.getAlertType())
                        .severity(r.getSeverity())
                        .title(r.getTitle())
                        .description(r.getDescription())
                        .triggerRule(r.getTriggerRule())
                        .status(r.getStatus())
                        .detectedAt(r.getDetectedAt())
                        .resolvedAt(r.getResolvedAt())
                        .resolvedBy(r.getResolvedBy())
                        .build())
                .collect(Collectors.toList());
    }

    private int calculateDelay(Project project, LocalDate reportDate) {
        if (project.getExpectedCompletionDate() == null) return 0;
        if (reportDate.isAfter(project.getExpectedCompletionDate())) {
            return (int) ChronoUnit.DAYS.between(project.getExpectedCompletionDate(), reportDate);
        }
        return 0;
    }

    private ProjectProgressResponse mapProgress(ProjectProgress p) {
        return ProjectProgressResponse.builder()
                .id(p.getId())
                .projectId(p.getProject().getId())
                .projectCode(p.getProject().getProjectId())
                .reportingDate(p.getReportingDate())
                .physicalProgressPercent(p.getPhysicalProgressPercent())
                .financialProgressPercent(p.getFinancialProgressPercent())
                .stageDescription(p.getStageDescription())
                .inspectionNotes(p.getInspectionNotes())
                .reportedBy(p.getReportedBy())
                .delayDays(p.getDelayDays())
                .isDelayed(p.getIsDelayed())
                .delayReason(p.getDelayReason())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private void verifyProjectAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRole();
        if ("ROLE_MINISTRY_ADMIN".equals(role)) return;
        if ("ROLE_STATE_NODAL_AUTHORITY".equals(role)) {
            if (currentUser.getStateId() != null && project.getState() != null
                    && currentUser.getStateId().equals(project.getState().getId())) return;
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: Project outside assigned State jurisdiction.");
        }
        if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
            if (currentUser.getDistrictId() != null && project.getDistrict() != null
                    && currentUser.getDistrictId().equals(project.getDistrict().getId())) return;
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: Project outside assigned District jurisdiction.");
        }
        if ("ROLE_MP".equals(role)) {
            if (currentUser.getConstituencyId() != null && project.getConstituency() != null
                    && currentUser.getConstituencyId().equals(project.getConstituency().getId())) return;
            if (project.getMpUser() != null && currentUser.getId().equals(project.getMpUser().getId())) return;
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: Project outside assigned Parliamentary Constituency.");
        }
    }
}
