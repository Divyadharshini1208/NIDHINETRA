package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "investigations", indexes = {
    @Index(name = "idx_investigations_project_id", columnList = "project_id"),
    @Index(name = "idx_investigations_case_no", columnList = "case_number"),
    @Index(name = "idx_investigations_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Investigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_alert_id")
    private RiskAlert riskAlert;

    @Column(name = "case_number", unique = true, nullable = false, length = 100)
    private String caseNumber; // e.g. INV-2024-0091

    @Column(name = "investigator_name", length = 150)
    private String investigatorName;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // ASSIGNED, IN_PROGRESS, COMPLETED, CLOSED

    @Column(name = "priority", length = 50)
    private String priority; // NORMAL, HIGH, URGENT

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "completion_date")
    private LocalDate completionDate;

    @Column(name = "findings_summary", columnDefinition = "TEXT")
    private String findingsSummary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
