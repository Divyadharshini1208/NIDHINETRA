package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private String paymentReference;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @NotBlank(message = "Payee name is required")
    private String payeeName;

    private String paymentMode; // PFMS, TREASURY, DIRECT_DBT, RTGS
    private String paymentStatus; // SUCCESS, PENDING, REJECTED
    private String beneficiaryAccount;
    private String remarks;
}
