package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsightsSummaryResponse {

    private Long totalProjects;
    private Long completedProjects;
    private Long ongoingProjects;
    private Long delayedProjects;
    private Long proposedProjects;

    private Double totalSanctionedCr;
    private Double totalExpenditureCr;
    private Double fundUtilizationRate; // percentage

    private Long anomaliesIdentifiedCount;
    private Long highRiskProjectsCount;

    private List<Map<String, Object>> stateWiseDistribution;
    private List<Map<String, Object>> categoryWiseDistribution;
    private List<Map<String, Object>> completionTrends;
    private List<Map<String, Object>> statusBreakdown;
    private List<Map<String, Object>> riskBreakdown;
}
