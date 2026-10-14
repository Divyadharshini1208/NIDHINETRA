package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InspectionQueueItemResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String categoryName;
    private String districtName;
    private String mpName;
    private Double sanctionedAmountLakhs;
    private Double releasedAmountLakhs;
    private Double expenditureAmountLakhs;
    private Double physicalProgressPct;
    private Double financialProgressPct;
    private Double progressMismatchGapPct;
    private Integer delayDays;
    private Double riskScore;
    private String riskLevel; // CRITICAL, HIGH, MEDIUM, LOW
    private List<String> contributingReasons;
    private String recommendedAction;
    private String inspectionStatus; // UNASSIGNED, PENDING_INSPECTION, IN_PROGRESS, COMPLETED
    private String assignedOfficer;
    private LocalDate deadline;
    private String findingsOutcome;
    private String priorityRank; // URGENT, HIGH, MEDIUM
}
