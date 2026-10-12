package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanctionResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String sanctionOrderNumber;
    private LocalDate sanctionDate;
    private Double sanctionedAmount;
    private String sanctioningAuthority;
    private String workOrderNumber;
    private String remarks;
    private LocalDateTime createdAt;
}
