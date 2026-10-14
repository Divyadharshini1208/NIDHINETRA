package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgencyReliabilityResponse {
    private String agencyName;
    private Integer totalProjects;
    private Integer completedProjects;
    private Integer activeProjects;
    private Integer delayedProjects;
    private Double totalSanctionedCr;
    private Double totalExpenditureCr;
    private Double onTimeCompletionRatePct;
    private Double averageDelayDays;
    private Double budgetVariancePct;
    private Double compositeReliabilityScore; // 0 to 100
    private String performanceBand; // A+, A, B, C
    private String bandDescription;
    private Map<String, Double> indicatorContributions; // Breakdown of score components
    private String dataCompletenessStatus; // ROBUST, MODERATE, PRELIMINARY
    private String statutoryNotice;
}
