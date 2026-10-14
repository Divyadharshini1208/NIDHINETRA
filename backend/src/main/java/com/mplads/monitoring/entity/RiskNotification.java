package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_notifications", indexes = {
    @Index(name = "idx_notif_project_id", columnList = "project_id"),
    @Index(name = "idx_notif_district_id", columnList = "district_id"),
    @Index(name = "idx_notif_state_id", columnList = "state_id"),
    @Index(name = "idx_notif_is_read", columnList = "is_read"),
    @Index(name = "idx_notif_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "project_code", length = 60)
    private String projectCode;

    @Column(name = "project_name", length = 300)
    private String projectName;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "severity", nullable = false, length = 30)
    private String severity; // CRITICAL, HIGH, MEDIUM, INFO

    @Column(name = "trigger_rule", length = 100)
    private String triggerRule; // PROGRESS_MISMATCH_GAP, SEVERE_DELAY_EXPENDITURE, HIGH_ANOMALY_SCORE

    @Column(name = "target_role", length = 50)
    private String targetRole; // null for all, or specific role like ROLE_DISTRICT_AUTHORITY

    @Column(name = "state_id")
    private Long stateId;

    @Column(name = "district_id")
    private Long districtId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
