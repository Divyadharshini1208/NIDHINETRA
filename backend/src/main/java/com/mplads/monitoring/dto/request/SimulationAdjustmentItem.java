package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationAdjustmentItem {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Hypothetical adjustment delta is required (in Lakhs, negative to reduce, positive to increase)")
    private Double adjustmentDeltaLakhs;

    private String targetSector;

    public SimulationAdjustmentItem(Long projectId, Double adjustmentDeltaLakhs) {
        this.projectId = projectId;
        this.adjustmentDeltaLakhs = adjustmentDeltaLakhs;
    }
}
