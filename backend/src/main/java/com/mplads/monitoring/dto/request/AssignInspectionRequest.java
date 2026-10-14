package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AssignInspectionRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Assigned officer name is required")
    private String officerName;

    private String officerDesignation;

    private LocalDate deadline;

    private String remarks;
}
