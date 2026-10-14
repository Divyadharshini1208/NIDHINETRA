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
public class SimulationResultResponse {
    private Long id;
    private String title;
    private String description;
    private String scopeType;
    private Long scopeId;
    private Double totalOriginalBudgetCr;
    private Double totalHypotheticalBudgetCr;
    private Double netReallocatedCr;
    private Integer projectsAdjustedCount;
    private Integer projectedBeneficiaryImpact;
    private Double projectedTimelineDeltaMonths; // negative indicates acceleration
    private Boolean isValidScenario;
    private List<String> validationMessages;
    private List<Map<String, Object>> simulatedProjectDeltas;
    private String statutoryNotice;
}
