package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.DashboardStatsResponse;
import com.mplads.monitoring.dto.response.InsightsSummaryResponse;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;
import java.util.Map;

public interface InsightsService {
    InsightsSummaryResponse getPublicInsightsSummary();
    List<Map<String, Object>> getStateWiseInsights();
    List<Map<String, Object>> getCategoryDistribution();
    DashboardStatsResponse getDashboardStats(UserPrincipal currentUser);
}
