package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sanctions", indexes = {
    @Index(name = "idx_sanctions_project_id", columnList = "project_id"),
    @Index(name = "idx_sanctions_order_no", columnList = "sanction_order_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sanction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "sanction_order_number", nullable = false, length = 100)
    private String sanctionOrderNumber;

    @Column(name = "sanction_date", nullable = false)
    private LocalDate sanctionDate;

    @Column(name = "sanctioned_amount", nullable = false)
    private Double sanctionedAmount; // Lakhs INR

    @Column(name = "sanctioning_authority", length = 150)
    private String sanctioningAuthority;

    @Column(name = "work_order_number", length = 100)
    private String workOrderNumber;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
