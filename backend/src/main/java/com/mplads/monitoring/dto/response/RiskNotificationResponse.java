package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskNotificationResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String title;
    private String message;
    private String severity; // CRITICAL, HIGH, MEDIUM, INFO
    private String triggerRule;
    private Long stateId;
    private Long districtId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
