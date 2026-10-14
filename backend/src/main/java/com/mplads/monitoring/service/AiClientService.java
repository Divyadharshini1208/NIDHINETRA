package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.entity.Project;

import java.util.List;
import java.util.Map;

public interface AiClientService {
    AiAnalysisPreviewResponse evaluateProject(Project project);
    Map<String, Object> detectDuplicates(Project targetProject, List<Project> candidates);
    boolean isAiServiceHealthy();
    Map<String, Object> queryGroundedAnalytics(String query, List<Project> scopedProjects);
    Map<String, Object> getAiModelsStatus();
    Map<String, Object> compareAiModels();
    Map<String, Object> evaluatePyTorch(Project project);
}
