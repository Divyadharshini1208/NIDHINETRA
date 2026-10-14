package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.AssignInspectionRequest;
import com.mplads.monitoring.dto.request.InspectionOutcomeRequest;
import com.mplads.monitoring.dto.response.InspectionQueueItemResponse;
import com.mplads.monitoring.entity.District;
import com.mplads.monitoring.entity.InspectionAssignment;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.repository.DistrictRepository;
import com.mplads.monitoring.repository.InspectionAssignmentRepository;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.repository.RiskAlertRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.impl.CollectorInspectionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CollectorInspectionServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private InspectionAssignmentRepository inspectionAssignmentRepository;

    @Mock
    private RiskAlertRepository riskAlertRepository;

    @Mock
    private DistrictRepository districtRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private CollectorInspectionServiceImpl collectorInspectionService;

    private Project testProject;
    private District testDistrict;
    private UserPrincipal testUser;

    @BeforeEach
    void setUp() {
        testDistrict = District.builder()
                .id(1L)
                .name("Pune")
                .code("MH-PUN")
                .build();

        testProject = Project.builder()
                .id(1L)
                .projectId("MH-PUN-2026-001")
                .projectName("Community Water Filtration Facility")
                .district(testDistrict)
                .riskScore(78.5)
                .riskLevel("HIGH")
                .build();

        testUser = UserPrincipal.builder()
                .id(101L)
                .email("collector.pune@gov.in")
                .fullName("District Collector Pune")
                .role("ROLE_DISTRICT_AUTHORITY")
                .districtId(1L)
                .build();
    }

    @Test
    @DisplayName("Should retrieve prioritized inspection queue for district authority")
    void testGetInspectionQueue() {
        when(projectRepository.findByDistrictId(1L)).thenReturn(List.of(testProject));
        when(inspectionAssignmentRepository.findByDistrictIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

        Page<InspectionQueueItemResponse> queue = collectorInspectionService.getInspectionQueue(
                testUser, 1L, PageRequest.of(0, 10)
        );

        assertThat(queue).isNotNull();
        assertThat(queue.getContent()).hasSize(1);
        assertThat(queue.getContent().get(0).getProjectName()).isEqualTo("Community Water Filtration Facility");
    }

    @Test
    @DisplayName("Should assign on-site inspection officer and target deadline")
    void testAssignInspection() {
        AssignInspectionRequest request = new AssignInspectionRequest();
        request.setProjectId(1L);
        request.setOfficerName("Er. D. S. Kulkarni");
        request.setOfficerDesignation("Executive Engineer");
        request.setDeadline(LocalDate.now().plusDays(14));
        request.setRemarks("Check structural slab foundation");

        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(inspectionAssignmentRepository.save(any(InspectionAssignment.class))).thenAnswer(invocation -> {
            InspectionAssignment a = invocation.getArgument(0);
            a.setId(99L);
            return a;
        });

        InspectionQueueItemResponse response = collectorInspectionService.assignInspection(testUser, request);

        assertThat(response).isNotNull();
        assertThat(response.getInspectionStatus()).isEqualTo("PENDING_INSPECTION");
        assertThat(response.getAssignedOfficer()).isEqualTo("Er. D. S. Kulkarni");
        verify(auditLogService).logAction(any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should record certified inspection outcome and update inspection status")
    void testRecordInspectionOutcome() {
        InspectionAssignment assignment = InspectionAssignment.builder()
                .id(99L)
                .project(testProject)
                .assignedOfficerName("Er. D. S. Kulkarni")
                .status("PENDING_INSPECTION")
                .createdAt(LocalDateTime.now())
                .build();

        InspectionOutcomeRequest request = new InspectionOutcomeRequest();
        request.setAssignmentId(99L);
        request.setOutcome("IRREGULARITY_FOUND");
        request.setSummary("Discrepancy observed between bill of quantities and actual civil execution");
        request.setRecommendedAction("SHOW_CAUSE_NOTICE");

        when(inspectionAssignmentRepository.findById(99L)).thenReturn(Optional.of(assignment));
        when(inspectionAssignmentRepository.save(any(InspectionAssignment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InspectionQueueItemResponse response = collectorInspectionService.recordInspectionOutcome(testUser, request);

        assertThat(response).isNotNull();
        assertThat(response.getInspectionStatus()).isEqualTo("COMPLETED");
        assertThat(response.getFindingsOutcome()).isEqualTo("IRREGULARITY_FOUND");
        verify(auditLogService).logAction(any(), any(), any(), any(), any(), any());
    }
}
