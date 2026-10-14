package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InspectionOutcomeRequest {
    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;

    @NotBlank(message = "Findings outcome is required")
    private String outcome; // SATISFACTORY, MINOR_ISSUES, IRREGULARITY_FOUND, SEVERE_MISMATCH, ESCALATED

    @NotBlank(message = "Findings summary is required")
    private String summary;

    private String recommendedAction;
}
