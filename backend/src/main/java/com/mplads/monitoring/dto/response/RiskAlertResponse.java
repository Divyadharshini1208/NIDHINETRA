package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAlertResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String stateName;
    private String districtName;
    private String categoryName;
    private Double sanctionedAmount;
    private Integer physicalProgress;
    private Double financialProgress;
    private Integer riskScore;
    private String alertType;
    private String severity;
    private String title;
    private String description;
    private List<String> reasons;
    private String triggerRule;
    private String status;
    private String assignedTo;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
    private InvestigationResponse investigation;
}
