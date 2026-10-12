package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_progress_logs", indexes = {
    @Index(name = "idx_progress_project_id", columnList = "project_id"),
    @Index(name = "idx_progress_report_date", columnList = "reporting_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "reporting_date", nullable = false)
    private LocalDate reportingDate;

    @Column(name = "physical_progress_percent", nullable = false)
    private Integer physicalProgressPercent; // 0-100%

    @Column(name = "financial_progress_percent", nullable = false)
    private Double financialProgressPercent; // 0-100%

    @Column(name = "stage_description", length = 300)
    private String stageDescription;

    @Column(name = "inspection_notes", columnDefinition = "TEXT")
    private String inspectionNotes;

    @Column(name = "reported_by", length = 150)
    private String reportedBy;

    @Column(name = "delay_days")
    private Integer delayDays;

    @Column(name = "is_delayed")
    private Boolean isDelayed;

    @Column(name = "delay_reason", length = 500)
    private String delayReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
