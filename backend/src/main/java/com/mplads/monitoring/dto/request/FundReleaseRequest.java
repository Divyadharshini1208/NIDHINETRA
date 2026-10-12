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
public class FundReleaseRequest {

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @NotNull(message = "Installment number is required")
    private Integer installmentNumber;

    @NotBlank(message = "Release order number is required")
    private String releaseOrderNumber;

    @NotNull(message = "Release date is required")
    private LocalDate releaseDate;

    @NotNull(message = "Released amount is required")
    @Positive(message = "Released amount must be positive")
    private Double releasedAmount;

    private String disbursedBy;
    private String pfmsReference;
    private String remarks;
}
