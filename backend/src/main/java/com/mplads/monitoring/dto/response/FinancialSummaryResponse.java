package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialSummaryResponse {
    private Double totalSanctionedCr;
    private Double totalReleasedCr;
    private Double totalExpenditureCr;
    private Double totalUnspentBalanceCr;
    private Double overallUtilizationPercent; // (totalExpenditure / totalReleased) * 100

    private List<Map<String, Object>> categoryWiseFinancials;
    private List<Map<String, Object>> stateWiseFinancials;
    private List<Map<String, Object>> monthlyExpenditureTrend;
}
