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
public class SanctionRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotBlank(message = "Sanction order number is required")
    private String sanctionOrderNumber;

    @NotNull(message = "Sanction date is required")
    private LocalDate sanctionDate;

    @NotNull(message = "Sanctioned amount is required")
    @Positive(message = "Sanctioned amount must be positive")
    private Double sanctionedAmount;

    private String sanctioningAuthority;
    private String workOrderNumber;
    private String remarks;
}
