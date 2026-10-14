package com.mplads.monitoring.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoVerificationResponse {
    private Long id;
    private Long projectId;
    private String projectCode;
    private String fileName;
    private String fileUrl;
    private String fileHash;
    private Double projectApprovedLatitude;
    private Double projectApprovedLongitude;
    private Double extractedLatitude;
    private Double extractedLongitude;
    private Double distanceMeters;
    private Double thresholdMeters;
    private String verificationStatus; // LOCATION_MATCH, LOCATION_MISMATCH, GPS_METADATA_MISSING, POSSIBLE_DUPLICATE_IMAGE, MANUAL_VERIFICATION_REQUIRED
    private LocalDateTime exifTimestamp;
    private String verificationNotes;
    private String verifiedBy;
    private LocalDateTime verifiedAt;
}
