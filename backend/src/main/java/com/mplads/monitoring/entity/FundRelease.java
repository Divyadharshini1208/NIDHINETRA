package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fund_releases", indexes = {
    @Index(name = "idx_fund_releases_project_id", columnList = "project_id"),
    @Index(name = "idx_fund_releases_order_no", columnList = "release_order_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundRelease {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "release_order_number", nullable = false, length = 100)
    private String releaseOrderNumber;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "released_amount", nullable = false)
    private Double releasedAmount; // Lakhs INR

    @Column(name = "disbursed_by", length = 150)
    private String disbursedBy;

    @Column(name = "pfms_reference", length = 100)
    private String pfmsReference;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
