package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenditures", indexes = {
    @Index(name = "idx_expenditures_project_id", columnList = "project_id"),
    @Index(name = "idx_expenditures_voucher_no", columnList = "voucher_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expenditure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "voucher_number", nullable = false, length = 100)
    private String voucherNumber;

    @Column(name = "expenditure_date", nullable = false)
    private LocalDate expenditureDate;

    @Column(name = "amount", nullable = false)
    private Double amount; // Lakhs INR

    @Column(name = "component_name", length = 150)
    private String componentName;

    @Column(name = "vendor_name", length = 150)
    private String vendorName;

    @Column(name = "utilization_certificate_number", length = 100)
    private String utilizationCertificateNumber;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
