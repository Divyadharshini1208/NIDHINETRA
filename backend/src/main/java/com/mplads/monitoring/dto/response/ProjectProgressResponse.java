package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProgressResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private LocalDate reportingDate;
    private Integer physicalProgressPercent;
    private Double financialProgressPercent;
    private String stageDescription;
    private String inspectionNotes;
    private String reportedBy;
    private Integer delayDays;
    private Boolean isDelayed;
    private String delayReason;
    private LocalDateTime createdAt;
}
