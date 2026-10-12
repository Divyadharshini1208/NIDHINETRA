package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.ProjectProgressRequest;
import com.mplads.monitoring.dto.response.DocumentResponse;
import com.mplads.monitoring.dto.response.ProjectProgressResponse;
import com.mplads.monitoring.dto.response.RiskAlertResponse;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;

public interface ProgressService {

    List<ProjectProgressResponse> getProjectProgressLogs(Long projectId, UserPrincipal currentUser);

    ProjectProgressResponse recordProgress(ProjectProgressRequest request, UserPrincipal currentUser);

    List<DocumentResponse> getProjectDocuments(Long projectId, UserPrincipal currentUser);

    List<RiskAlertResponse> getProjectRiskAlerts(Long projectId, UserPrincipal currentUser);
}
