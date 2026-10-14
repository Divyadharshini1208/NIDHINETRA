package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationEvaluateRequest {
    @NotBlank(message = "Scenario title is required")
    private String title;

    private String description;

    private String scopeType; // NATIONAL, STATE, DISTRICT, CONSTITUENCY

    private Long scopeId;

    @NotEmpty(message = "At least one project adjustment is required")
    private List<SimulationAdjustmentItem> adjustments;
}
