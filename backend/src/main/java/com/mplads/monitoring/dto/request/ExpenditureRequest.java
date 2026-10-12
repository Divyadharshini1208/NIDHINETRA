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
public class ExpenditureRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Voucher number is required")
    private String voucherNumber;

    @NotNull(message = "Expenditure date is required")
    private LocalDate expenditureDate;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    private String componentName;
    private String vendorName;
    private String utilizationCertificateNumber;
    private String remarks;
}
