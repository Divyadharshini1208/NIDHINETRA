package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects", indexes = {
    @Index(name = "idx_projects_project_id", columnList = "project_id"),
    @Index(name = "idx_projects_state_id", columnList = "state_id"),
    @Index(name = "idx_projects_district_id", columnList = "district_id"),
    @Index(name = "idx_projects_constituency_id", columnList = "constituency_id"),
    @Index(name = "idx_projects_category_id", columnList = "category_id"),
    @Index(name = "idx_projects_mp_user_id", columnList = "mp_user_id"),
    @Index(name = "idx_projects_status", columnList = "status"),
    @Index(name = "idx_projects_risk_level", columnList = "risk_level"),
    @Index(name = "idx_projects_start_date", columnList = "start_date"),
    @Index(name = "idx_projects_expected_comp_date", columnList = "expected_completion_date"),
    @Index(name = "idx_projects_status_risk", columnList = "status, risk_level"),
    @Index(name = "idx_projects_state_status", columnList = "state_id, status"),
    @Index(name = "idx_projects_dist_risk", columnList = "district_id, risk_level"),
    @Index(name = "idx_projects_agency", columnList = "implementing_agency")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", unique = true, nullable = false, length = 60)
    private String projectId; // e.g. MPLADS-MH-PUN-2024-001

    @Column(name = "project_name", nullable = false, length = 300)
    private String projectName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "constituency_id")
    private Constituency constituency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mp_user_id")
    private User mpUser;

    @Column(name = "mp_name", length = 150)
    private String mpName;

    @Column(name = "implementing_agency", length = 200)
    private String implementingAgency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProjectCategory category;

    @Column(name = "category_name", length = 100)
    private String categoryName;

    @Column(name = "sanctioned_amount", nullable = false)
    private Double sanctionedAmount; // in Lakhs INR

    @Column(name = "released_amount", nullable = false)
    private Double releasedAmount; // in Lakhs INR

    @Column(name = "expenditure_amount", nullable = false)
    private Double expenditureAmount; // in Lakhs INR

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(name = "physical_progress", nullable = false)
    private Integer physicalProgress; // 0-100%

    @Column(name = "financial_progress", nullable = false)
    private Double financialProgress; // 0-100%

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private ProjectStatus status;

    @Column(name = "risk_level", length = 50)
    private String riskLevel; // LOW, MODERATE, HIGH, CRITICAL, ANOMALY_FLAGGED

    @Column(name = "risk_score")
    private Double riskScore; // 0 to 100

    @Column(name = "risk_reason", length = 1000)
    private String riskReason;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "delay_days")
    private Integer delayDays;

    @Column(name = "beneficiaries")
    private Integer beneficiaries;

    @Column(name = "location_details", length = 300)
    private String locationDetails;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "feasibility_remarks", columnDefinition = "TEXT")
    private String feasibilityRemarks;

    @Column(name = "reviewed_by", length = 150)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper calculation method
    public Double calculateUtilization() {
        if (releasedAmount == null || releasedAmount <= 0.0) {
            return 0.0;
        }
        if (expenditureAmount == null) {
            return 0.0;
        }
        return Math.round((expenditureAmount / releasedAmount * 100.0) * 100.0) / 100.0;
    }
}
