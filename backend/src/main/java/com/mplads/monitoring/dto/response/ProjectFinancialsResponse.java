package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectFinancialsResponse {
    private Long projectId;
    private String projectCode;
    private String projectName;
    private Double sanctionedAmount;
    private Double releasedAmount;
    private Double expenditureAmount;
    private Double balanceWithImplementingAgency; // released - expenditure
    private Double unreleasedAmount; // sanctioned - released
    private Double utilizationPercent; // (expenditure / released) * 100
    private Double financialProgressPercent; // (expenditure / sanctioned) * 100

    private List<SanctionResponse> sanctions;
    private List<FundReleaseResponse> fundReleases;
    private List<ExpenditureResponse> expenditures;
    private List<PaymentResponse> payments;
}
