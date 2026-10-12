package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payments_project_id", columnList = "project_id"),
    @Index(name = "idx_payments_ref", columnList = "payment_reference"),
    @Index(name = "idx_payments_status", columnList = "payment_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "payment_reference", unique = true, nullable = false, length = 100)
    private String paymentReference;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount", nullable = false)
    private Double amount; // Lakhs INR

    @Column(name = "payee_name", nullable = false, length = 150)
    private String payeeName;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode; // PFMS, TREASURY, DIRECT_DBT, RTGS

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus; // SUCCESS, PENDING, REJECTED, PROCESSING

    @Column(name = "beneficiary_account", length = 50)
    private String beneficiaryAccount;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
