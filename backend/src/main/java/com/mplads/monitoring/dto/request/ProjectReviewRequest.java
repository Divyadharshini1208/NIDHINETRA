package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectReviewRequest {

    @NotBlank(message = "Review action is required (SANCTION or REJECT)")
    private String action; // SANCTION, REJECT

    private String remarks; // Feasibility assessment & scrutiny remarks

    private Double sanctionedAmount; // Final sanctioned amount in Lakhs

    private String sanctionOrderNumber; // Official sanction order reference

    private LocalDate sanctionDate;

    private String workOrderNumber;

    private String implementingAgency;
}
