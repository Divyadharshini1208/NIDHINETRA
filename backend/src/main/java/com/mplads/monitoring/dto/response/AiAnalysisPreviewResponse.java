package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAnalysisPreviewResponse {
    private Long projectId;
    private String projectCode;
    private String overallHealth; // NORMAL, ATTENTION_REQUIRED, ANOMALOUS, HIGH_RISK
    private Double anomalyRiskScore; // 0-100
    private String riskClassification;
    private List<AnomalyIndicator> anomalyIndicators;
    private PredictiveTimeline predictiveTimeline;
    private List<String> aiRecommendations;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnomalyIndicator {
        private String featureName;
        private String detectedPattern;
        private String confidence;
        private String severity;
        private String explanation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PredictiveTimeline {
        private String expectedCompletion;
        private String aiEstimatedCompletion;
        private Integer estimatedDelayDays;
        private Double costOverrunRiskPercent;
    }
}
