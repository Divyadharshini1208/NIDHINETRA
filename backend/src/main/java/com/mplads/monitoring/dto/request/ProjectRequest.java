package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRequest {

    private String projectId; // optional for auto-generation if not provided

    @NotBlank(message = "Project name is required")
    private String projectName;

    private String description;

    @NotNull(message = "State ID is required")
    private Long stateId;

    @NotNull(message = "District ID is required")
    private Long districtId;

    private Long constituencyId;

    private Long mpUserId;

    private String mpName;

    private String implementingAgency;

    private Long categoryId;

    private String categoryName;

    @NotNull(message = "Sanctioned amount is required")
    @PositiveOrZero(message = "Sanctioned amount must be non-negative")
    private Double sanctionedAmount;

    @PositiveOrZero(message = "Released amount must be non-negative")
    private Double releasedAmount;

    @PositiveOrZero(message = "Expenditure amount must be non-negative")
    private Double expenditureAmount;

    private LocalDate startDate;

    private LocalDate expectedCompletionDate;

    private LocalDate actualCompletionDate;

    private Integer physicalProgress;

    private Double financialProgress;

    private String status; // PROPOSED, SANCTIONED, ONGOING, DELAYED, COMPLETED, CANCELLED

    private String riskLevel;

    private String riskReason;

    private Double latitude;

    private Double longitude;

    private Integer beneficiaries;

    private String locationDetails;

    private String documentUrl;

    private String feasibilityRemarks;
}
