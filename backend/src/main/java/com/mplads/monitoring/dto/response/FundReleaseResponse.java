package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundReleaseResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private Integer installmentNumber;
    private String releaseOrderNumber;
    private LocalDate releaseDate;
    private Double releasedAmount;
    private String disbursedBy;
    private String pfmsReference;
    private String remarks;
    private LocalDateTime createdAt;
}
