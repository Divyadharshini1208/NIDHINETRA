package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "inspection_assignments", indexes = {
    @Index(name = "idx_insp_project_id", columnList = "project_id"),
    @Index(name = "idx_insp_district_id", columnList = "district_id"),
    @Index(name = "idx_insp_status", columnList = "status"),
    @Index(name = "idx_insp_priority", columnList = "priority_score")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "district_id", nullable = false)
    private Long districtId;

    @Column(name = "assigned_officer_name", nullable = false, length = 150)
    private String assignedOfficerName;

    @Column(name = "assigned_officer_designation", length = 100)
    private String assignedOfficerDesignation;

    @Column(name = "assigned_by", nullable = false, length = 150)
    private String assignedBy;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING_INSPECTION, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "priority_score")
    private Double priorityScore; // Dynamic inspection priority (0-100)

    @Column(name = "priority_rank", length = 20)
    private String priorityRank; // URGENT, HIGH, MEDIUM, LOW

    @Column(name = "findings_outcome", length = 50)
    private String findingsOutcome; // SATISFACTORY, MINOR_ISSUES, IRREGULARITY_FOUND, SEVERE_MISMATCH, ESCALATED

    @Column(name = "findings_summary", columnDefinition = "TEXT")
    private String findingsSummary;

    @Column(name = "recommended_action", length = 500)
    private String recommendedAction;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
