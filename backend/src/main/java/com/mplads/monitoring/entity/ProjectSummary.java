package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects_summary", indexes = {
    @Index(name = "idx_project_state", columnList = "state_id"),
    @Index(name = "idx_project_district", columnList = "district_id"),
    @Index(name = "idx_project_status", columnList = "status"),
    @Index(name = "idx_project_risk", columnList = "risk_level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_code", unique = true, nullable = false, length = 50)
    private String projectCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "category", nullable = false, length = 100)
    private String category; // Drinking Water, Education, Healthcare, Roads & Bridges, Sanitation, Rural Infra

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "constituency_id")
    private Constituency constituency;

    @Column(name = "implementing_agency", length = 150)
    private String implementingAgency;

    @Column(name = "sanctioned_amount_lakhs", nullable = false)
    private Double sanctionedAmountLakhs;

    @Column(name = "expenditure_amount_lakhs", nullable = false)
    private Double expenditureAmountLakhs;

    @Column(name = "physical_progress_percent", nullable = false)
    private Integer physicalProgressPercent;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // COMPLETED, ONGOING, DELAYED, SANCTIONED, PROPOSED

    @Column(name = "risk_level", length = 50)
    private String riskLevel; // LOW, MODERATE, HIGH, ANOMALY_FLAGGED

    @Column(name = "risk_reason", length = 500)
    private String riskReason;

    @Column(name = "sanction_date")
    private LocalDate sanctionDate;

    @Column(name = "expected_completion_date")
    private LocalDate expectedCompletionDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
