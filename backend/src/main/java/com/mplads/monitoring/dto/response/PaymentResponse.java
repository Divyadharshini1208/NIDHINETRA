package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String paymentReference;
    private LocalDate paymentDate;
    private Double amount;
    private String payeeName;
    private String paymentMode;
    private String paymentStatus;
    private String beneficiaryAccount;
    private String remarks;
    private LocalDateTime createdAt;
}
