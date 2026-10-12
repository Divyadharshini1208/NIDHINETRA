package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenditureResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String voucherNumber;
    private LocalDate expenditureDate;
    private Double amount;
    private String componentName;
    private String vendorName;
    private String utilizationCertificateNumber;
    private String remarks;
    private LocalDateTime createdAt;
}
