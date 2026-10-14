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
    private PyTorchEvaluation pytorchEvaluation;
    private FundUtilization fundUtilization;

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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PyTorchEvaluation {
        private String modelName;
        private String modelVersion;
        private String modelStatus;
        private String device;
        private Double reconstructionMse;
        private Double thresholdMse;
        private Boolean isAnomalous;
        private Double reconstructionConfidence;
        private String indicator;
        private String explanation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FundUtilization {
        private Double sanctionedAmountLakhs;
        private Double releasedAmountLakhs;
        private Double expenditureAmountLakhs;
        private Double unspentBalanceLakhs;
        private Double fundUtilizationPct;
        private Double drawdownRatioPct;
        private Double physicalProgressPct;
        private Double financialProgressPct;
        private Double progressDivergenceGap;
        private Double expenditurePerProgressPoint;
        private String dataCompletenessStatus;
        private List<String> dataQualityWarnings;
        private Boolean isValidForMlInference;
    }
}
