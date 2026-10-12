package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private String role;
    private String scopeName; // National, State Name, District Name, or Constituency Name
    private Long totalAssignedProjects;
    private Long completedCount;
    private Long ongoingCount;
    private Long delayedCount;
    private Long reviewRequiredCount;

    private Double sanctionedAmountCr;
    private Double expenditureAmountCr;
    private Double utilizationRate;

    private List<Map<String, Object>> recentProjects;
    private List<Map<String, Object>> pendingApprovals;
    private List<Map<String, Object>> flaggedAnomalies;
    private List<Map<String, Object>> recentAuditLogs;
}
