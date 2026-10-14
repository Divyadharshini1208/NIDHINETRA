package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.PhotoVerificationResponse;
import com.mplads.monitoring.entity.PhotoVerification;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.repository.PhotoVerificationRepository;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.impl.PhotoVerificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PhotoVerificationServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private PhotoVerificationRepository photoVerificationRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private PhotoVerificationServiceImpl photoVerificationService;

    private Project testProject;
    private UserPrincipal testUser;

    @BeforeEach
    void setUp() {
        testProject = Project.builder()
                .id(1L)
                .projectId("MH-PUN-2026-001")
                .projectName("Community Water Filtration Facility")
                .latitude(18.5204)  // Pune baseline
                .longitude(73.8567)
                .build();

        testUser = UserPrincipal.builder()
                .id(101L)
                .email("collector_pune@gov.in")
                .fullName("District Collector Pune")
                .role("ROLE_DISTRICT_AUTHORITY")
                .build();
    }

    @Test
    @DisplayName("Geofence Verification: photo coordinates within 500m of project site yield LOCATION_MATCH")
    void testLocationMatchWithin500m() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(photoVerificationRepository.findFirstByFileHash(any())).thenReturn(Optional.empty());
        when(photoVerificationRepository.save(any())).thenAnswer(invocation -> {
            PhotoVerification pv = invocation.getArgument(0);
            pv.setId(10L);
            return pv;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file", "site_progress.jpg", "image/jpeg", "fake-image-bytes".getBytes()
        );

        // Coordinates ~100 meters away from project site
        Double capturedLat = 18.5210;
        Double capturedLon = 73.8572;

        PhotoVerificationResponse response = photoVerificationService.verifyProjectPhoto(
                testUser, 1L, file, capturedLat, capturedLon
        );

        assertThat(response).isNotNull();
        assertThat(response.getVerificationStatus()).isEqualTo("LOCATION_MATCH");
        assertThat(response.getDistanceMeters()).isLessThan(500.0);
    }

    @Test
    @DisplayName("Geofence Alert: photo coordinates > 500m from project site yield LOCATION_MISMATCH")
    void testLocationMismatchExceeding500m() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(photoVerificationRepository.findFirstByFileHash(any())).thenReturn(Optional.empty());
        when(photoVerificationRepository.save(any())).thenAnswer(invocation -> {
            PhotoVerification pv = invocation.getArgument(0);
            pv.setId(11L);
            return pv;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file", "site_progress_far.jpg", "image/jpeg", "different-image-bytes".getBytes()
        );

        // Coordinates ~5 kilometers away from project site
        Double capturedLat = 18.5600;
        Double capturedLon = 73.8900;

        PhotoVerificationResponse response = photoVerificationService.verifyProjectPhoto(
                testUser, 1L, file, capturedLat, capturedLon
        );

        assertThat(response).isNotNull();
        assertThat(response.getVerificationStatus()).isEqualTo("LOCATION_MISMATCH");
        assertThat(response.getDistanceMeters()).isGreaterThan(500.0);
    }

    @Test
    @DisplayName("Missing GPS: photo without EXIF or coordinates yields GPS_METADATA_MISSING")
    void testGpsMetadataMissing() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(photoVerificationRepository.findFirstByFileHash(any())).thenReturn(Optional.empty());
        when(photoVerificationRepository.save(any())).thenAnswer(invocation -> {
            PhotoVerification pv = invocation.getArgument(0);
            pv.setId(12L);
            return pv;
        });

        MockMultipartFile file = new MockMultipartFile(
                "file", "stripped_metadata.jpg", "image/jpeg", "image-without-gps-exif".getBytes()
        );

        PhotoVerificationResponse response = photoVerificationService.verifyProjectPhoto(
                testUser, 1L, file, null, null
        );

        assertThat(response).isNotNull();
        assertThat(response.getVerificationStatus()).isEqualTo("GPS_METADATA_MISSING");
    }
}
