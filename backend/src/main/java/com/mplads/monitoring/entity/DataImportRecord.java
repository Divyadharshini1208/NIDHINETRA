package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_import_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataImportRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", length = 50)
    private String fileType; // CSV, XLSX

    @Column(name = "uploaded_by", length = 150)
    private String uploadedBy;

    @Column(name = "total_records")
    private Integer totalRecords;

    @Column(name = "valid_records")
    private Integer validRecords;

    @Column(name = "invalid_records")
    private Integer invalidRecords;

    @Column(name = "duplicate_records")
    private Integer duplicateRecords;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // COMPLETED, FAILED, PARTIAL

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
