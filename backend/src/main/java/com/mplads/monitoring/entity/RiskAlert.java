package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_alerts", indexes = {
    @Index(name = "idx_risk_alerts_project_id", columnList = "project_id"),
    @Index(name = "idx_risk_alerts_severity", columnList = "severity"),
    @Index(name = "idx_risk_alerts_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "alert_type", nullable = false, length = 100)
    private String alertType; // PROGRESS_FINANCIAL_MISMATCH, DELAY_EXCEEDED, PAYMENT_ANOMALY, UTILIZATION_LAG

    @Column(name = "risk_score")
    private Integer riskScore; // 0-100

    @Column(name = "severity", nullable = false, length = 50)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reasons", columnDefinition = "TEXT")
    private String reasons; // JSON or newline separated explainability points

    @Column(name = "trigger_rule", length = 255)
    private String triggerRule;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // NEW, UNDER_REVIEW, INVESTIGATING, RESOLVED, DISMISSED

    @Column(name = "assigned_to", length = 150)
    private String assignedTo;

    @CreationTimestamp
    @Column(name = "detected_at", nullable = false, updatable = false)
    private LocalDateTime detectedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 150)
    private String resolvedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
