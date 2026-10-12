package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficialMpladsDataResponse {
    private boolean isLiveFetched;
    private String sourcePortalUrl;
    private String sourceName;
    private String currentTenure;
    private LocalDateTime fetchedAt;
    private String statutoryNotice;
    
    // Official Macro Totals from MoSPI
    private String allocatedLimitCr;
    private String allocatedLimitRaw;
    
    private Long worksRecommendedCount;
    private String worksRecommendedCr;
    private String worksRecommendedRaw;
    
    private Long worksSanctionedCount;
    private String worksSanctionedCr;
    private String worksSanctionedRaw;
    
    private Long worksCompletedCount;
    private String worksCompletedCr;
    private String worksCompletedRaw;
    
    private String expenditureOngoingCompletedCr;
    private String expenditureOngoingCompletedRaw;
    
    private Long calamityWorksCount;
    private String calamityAmountCr;
    
    private List<Map<String, Object>> officialStates;
}
