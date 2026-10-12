package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProgressRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Reporting date is required")
    private LocalDate reportingDate;

    @NotNull(message = "Physical progress percent is required")
    @Min(0) @Max(100)
    private Integer physicalProgressPercent;

    @Min(0) @Max(100)
    private Double financialProgressPercent;

    private String stageDescription;
    private String inspectionNotes;
    private String reportedBy;
    private Integer delayDays;
    private Boolean isDelayed;
    private String delayReason;
}
