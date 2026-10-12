package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMonitoringSummaryResponse {
    private long totalFlaggedAlerts;
    private long lowRiskCount;
    private long mediumRiskCount;
    private long highRiskCount;
    private long criticalRiskCount;
    private long costAnomaliesCount;
    private long duplicateRiskCount;
    private long delayedProjectsCount;
    private long paymentAnomaliesCount;
    private long progressMismatchCount;
    private double averageRiskScore;
    private List<Map<String, Object>> riskScoreDistribution;
    private List<Map<String, Object>> anomalyTypeBreakdown;
    private List<Map<String, Object>> stateRiskDistribution;
    private List<Map<String, Object>> districtRiskDistribution;
    private List<ProjectResponse> topHighRiskProjects;
    private List<RiskAlertResponse> recentAlerts;
}
