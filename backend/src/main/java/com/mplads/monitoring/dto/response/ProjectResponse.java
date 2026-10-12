package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private Long id;
    private String projectId;
    private String projectName;
    private String description;

    private Long stateId;
    private String stateCode;
    private String stateName;

    private Long districtId;
    private String districtCode;
    private String districtName;

    private Long constituencyId;
    private String constituencyCode;
    private String constituencyName;

    private Long mpUserId;
    private String mpName;

    private String implementingAgency;
    private Long categoryId;
    private String categoryCode;
    private String categoryName;

    private Double sanctionedAmount; // Lakhs
    private Double releasedAmount;   // Lakhs
    private Double expenditureAmount;// Lakhs
    private Double utilizationPercent;

    private LocalDate startDate;
    private LocalDate expectedCompletionDate;
    private LocalDate actualCompletionDate;

    private Integer physicalProgress;
    private Double financialProgress;
    private String status;

    private String riskLevel;
    private Double riskScore;
    private String riskReason;

    private Double latitude;
    private Double longitude;

    private Integer delayDays;
    private Boolean isDelayed;

    private Integer beneficiaries;
    private String locationDetails;
    private String documentUrl;
    private String feasibilityRemarks;
    private String reviewedBy;
    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
