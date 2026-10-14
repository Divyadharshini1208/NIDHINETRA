package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.AgencyReliabilityResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.ProjectStatus;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.service.impl.AgencyAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgencyAnalyticsServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private AgencyAnalyticsServiceImpl agencyAnalyticsService;

    private List<Project> highPerformingProjects;
    private List<Project> delayedProjects;

    @BeforeEach
    void setUp() {
        // High performing agency projects: on-time, budget disciplined
        highPerformingProjects = List.of(
                Project.builder()
                        .id(1L)
                        .projectId("MH-PUN-01")
                        .implementingAgency("Zilla Parishad Pune")
                        .status(ProjectStatus.COMPLETED)
                        .sanctionedAmount(50.0)
                        .expenditureAmount(48.0)
                        .delayDays(0)
                        .riskLevel("LOW")
                        .build(),
                Project.builder()
                        .id(2L)
                        .projectId("MH-PUN-02")
                        .implementingAgency("Zilla Parishad Pune")
                        .status(ProjectStatus.COMPLETED)
                        .sanctionedAmount(40.0)
                        .expenditureAmount(39.0)
                        .delayDays(0)
                        .riskLevel("LOW")
                        .build(),
                Project.builder()
                        .id(3L)
                        .projectId("MH-PUN-03")
                        .implementingAgency("Zilla Parishad Pune")
                        .status(ProjectStatus.COMPLETED)
                        .sanctionedAmount(30.0)
                        .expenditureAmount(30.0)
                        .delayDays(0)
                        .riskLevel("LOW")
                        .build(),
                Project.builder()
                        .id(4L)
                        .projectId("MH-PUN-04")
                        .implementingAgency("Zilla Parishad Pune")
                        .status(ProjectStatus.COMPLETED)
                        .sanctionedAmount(60.0)
                        .expenditureAmount(58.0)
                        .delayDays(0)
                        .riskLevel("LOW")
                        .build()
        );

        // Underperforming agency projects: high delays, large variance, high risk
        delayedProjects = List.of(
                Project.builder()
                        .id(10L)
                        .projectId("MH-PUN-10")
                        .implementingAgency("Faulty Contractor Corp")
                        .status(ProjectStatus.DELAYED)
                        .sanctionedAmount(100.0)
                        .expenditureAmount(20.0)
                        .delayDays(250)
                        .riskLevel("CRITICAL")
                        .build(),
                Project.builder()
                        .id(11L)
                        .projectId("MH-PUN-11")
                        .implementingAgency("Faulty Contractor Corp")
                        .status(ProjectStatus.DELAYED)
                        .sanctionedAmount(80.0)
                        .expenditureAmount(10.0)
                        .delayDays(300)
                        .riskLevel("HIGH")
                        .build()
        );
    }

    @Test
    @DisplayName("Agency Reliability: High-performing agency earns Band A+ or A rating")
    void testHighPerformingAgencyRating() {
        when(projectRepository.findByImplementingAgencyIgnoreCase("Zilla Parishad Pune"))
                .thenReturn(highPerformingProjects);

        AgencyReliabilityResponse response = agencyAnalyticsService.getAgencyDetails("Zilla Parishad Pune");

        assertThat(response).isNotNull();
        assertThat(response.getCompositeReliabilityScore()).isGreaterThanOrEqualTo(70.0);
        assertThat(response.getPerformanceBand()).isIn("A+", "A");
        assertThat(response.getOnTimeCompletionRatePct()).isEqualTo(100.0);
        assertThat(response.getAverageDelayDays()).isEqualTo(0.0);
        assertThat(response.getIndicatorContributions()).containsKey("OnTimeCompletionPts");
        assertThat(response.getStatutoryNotice()).contains("empirical statistical benchmarks");
    }

    @Test
    @DisplayName("Agency Reliability: Severely delayed agency earns Band C or B rating with explainable penalties")
    void testUnderperformingAgencyRating() {
        when(projectRepository.findByImplementingAgencyIgnoreCase("Faulty Contractor Corp"))
                .thenReturn(delayedProjects);

        AgencyReliabilityResponse response = agencyAnalyticsService.getAgencyDetails("Faulty Contractor Corp");

        assertThat(response).isNotNull();
        assertThat(response.getCompositeReliabilityScore()).isLessThan(70.0);
        assertThat(response.getPerformanceBand()).isIn("B", "C");
        assertThat(response.getDelayedProjects()).isEqualTo(2);
        assertThat(response.getAverageDelayDays()).isGreaterThan(200.0);
    }
}
