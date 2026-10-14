package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyInspectionSummaryResponse {
    private Long districtId;
    private String districtName;
    private long totalFlaggedHighRisk;
    private long pendingInspections;
    private long completedThisWeek;
    private long severeIrregularitiesFound;
    private double inspectionComplianceRatePct;
}
