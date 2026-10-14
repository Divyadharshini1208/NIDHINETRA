package com.mplads.monitoring.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "photo_verifications", indexes = {
    @Index(name = "idx_photo_project_id", columnList = "project_id"),
    @Index(name = "idx_photo_file_hash", columnList = "file_hash"),
    @Index(name = "idx_photo_status", columnList = "verification_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "file_hash", length = 64)
    private String fileHash; // SHA-256 for duplicate detection

    @Column(name = "extracted_latitude")
    private Double extractedLatitude;

    @Column(name = "extracted_longitude")
    private Double extractedLongitude;

    @Column(name = "distance_meters")
    private Double distanceMeters; // Haversine distance to project approved coordinates

    @Column(name = "threshold_meters")
    private Double thresholdMeters; // Configured threshold, e.g. 500m

    @Column(name = "verification_status", nullable = false, length = 50)
    private String verificationStatus; 
    // LOCATION_MATCH, LOCATION_MISMATCH, GPS_METADATA_MISSING, POSSIBLE_DUPLICATE_IMAGE, MANUAL_VERIFICATION_REQUIRED

    @Column(name = "exif_timestamp")
    private LocalDateTime exifTimestamp;

    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    @Column(name = "verified_by", length = 150)
    private String verifiedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
