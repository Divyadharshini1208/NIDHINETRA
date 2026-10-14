package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_scenarios", indexes = {
    @Index(name = "idx_sim_created_by", columnList = "created_by_user_id"),
    @Index(name = "idx_sim_scope", columnList = "scope_type, scope_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "scope_type", nullable = false, length = 50)
    private String scopeType; // NATIONAL, STATE, DISTRICT, CONSTITUENCY

    @Column(name = "scope_id")
    private Long scopeId;

    @Column(name = "total_original_budget_cr")
    private Double totalOriginalBudgetCr;

    @Column(name = "total_hypothetical_budget_cr")
    private Double totalHypotheticalBudgetCr;

    @Column(name = "reallocated_amount_cr")
    private Double reallocatedAmountCr;

    @Column(name = "projects_adjusted_count")
    private Integer projectsAdjustedCount;

    @Column(name = "projected_beneficiary_impact")
    private Integer projectedBeneficiaryImpact;

    @Column(name = "projected_timeline_delta_months")
    private Double projectedTimelineDeltaMonths; // e.g. -2.5 months acceleration

    @Column(name = "scenario_payload_json", columnDefinition = "TEXT", nullable = false)
    private String scenarioPayloadJson;

    @Column(name = "metrics_summary_json", columnDefinition = "TEXT")
    private String metricsSummaryJson;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_by_name", length = 150)
    private String createdByName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
