package com.mplads.monitoring.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mplads.monitoring.dto.request.SimulationAdjustmentItem;
import com.mplads.monitoring.dto.request.SimulationEvaluateRequest;
import com.mplads.monitoring.dto.response.SimulationResultResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.repository.SimulationScenarioRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.impl.FundSimulationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FundSimulationServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private SimulationScenarioRepository simulationScenarioRepository;

    @Mock
    private AuditLogService auditLogService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private FundSimulationServiceImpl fundSimulationService;

    private Project waterProject;
    private Project roadProject;
    private UserPrincipal testUser;

    @BeforeEach
    void setUp() {
        waterProject = Project.builder()
                .id(1L)
                .projectId("MH-PUN-WATER-01")
                .projectName("Rural Piped Water Supply")
                .categoryName("Drinking Water")
                .sanctionedAmount(50.0) // 50 Lakhs
                .expenditureAmount(20.0) // 20 Lakhs
                .physicalProgress(45)
                .build();

        roadProject = Project.builder()
                .id(2L)
                .projectId("MH-PUN-ROAD-02")
                .projectName("Approach Road Construction")
                .categoryName("Roads & Bridges")
                .sanctionedAmount(100.0) // 100 Lakhs
                .expenditureAmount(40.0) // 40 Lakhs
                .physicalProgress(30)
                .build();

        testUser = UserPrincipal.builder()
                .id(101L)
                .email("dm_pune@gov.in")
                .fullName("District Magistrate Pune")
                .role("ROLE_DISTRICT_AUTHORITY")
                .build();
    }

    @Test
    @DisplayName("Permissible What-If Reallocation: Reallocating ₹20 Lakhs to Drinking Water increases beneficiaries and remains valid")
    void testPermissibleReallocationScenario() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(waterProject));
        when(projectRepository.findById(2L)).thenReturn(Optional.of(roadProject));

        SimulationAdjustmentItem addWater = new SimulationAdjustmentItem(1L, 20.0); // +20 Lakhs
        SimulationAdjustmentItem cutRoad = new SimulationAdjustmentItem(2L, -20.0); // -20 Lakhs (new: 80L > spent 40L)

        SimulationEvaluateRequest request = SimulationEvaluateRequest.builder()
                .title("Drought Priority Water Shift")
                .description("Hypothetically moving ₹20 Lakhs unspent road budget to expedited drinking water")
                .scopeType("DISTRICT")
                .scopeId(1L)
                .adjustments(List.of(addWater, cutRoad))
                .build();

        SimulationResultResponse response = fundSimulationService.evaluateScenario(testUser, request);

        assertThat(response).isNotNull();
        assertThat(Boolean.TRUE.equals(response.getIsValidScenario())).isTrue();
        assertThat(response.getProjectsAdjustedCount()).isEqualTo(2);
        assertThat(response.getProjectedBeneficiaryImpact()).isGreaterThan(0);
        assertThat(response.getStatutoryNotice()).contains("Policy Simulation Only");
    }

    @Test
    @DisplayName("Constraint Check: Hypothetical allocation dropping below already incurred expenditure triggers caution warning")
    void testExpenditureConstraintViolation() {
        when(projectRepository.findById(2L)).thenReturn(Optional.of(roadProject));

        // Cut road budget by 70 Lakhs (sanctioned 100L - 70L = 30L < spent 40L)
        SimulationAdjustmentItem cutRoadExcessive = new SimulationAdjustmentItem(2L, -70.0);

        SimulationEvaluateRequest request = SimulationEvaluateRequest.builder()
                .title("Excessive Road Reduction")
                .scopeType("DISTRICT")
                .adjustments(List.of(cutRoadExcessive))
                .build();

        SimulationResultResponse response = fundSimulationService.evaluateScenario(testUser, request);

        assertThat(response).isNotNull();
        assertThat(Boolean.TRUE.equals(response.getIsValidScenario())).isFalse();
        assertThat(response.getValidationMessages()).anyMatch(msg -> msg.contains("less than already expended funds"));
    }

    @Test
    @DisplayName("Constraint Check: Negative budget adjustment is strictly prohibited")
    void testNegativeSanctionConstraint() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(waterProject));

        // Attempting to cut water budget by 100 Lakhs (50L - 100L = -50L)
        SimulationAdjustmentItem cutNegative = new SimulationAdjustmentItem(1L, -100.0);

        SimulationEvaluateRequest request = SimulationEvaluateRequest.builder()
                .title("Invalid Negative Scenario")
                .scopeType("DISTRICT")
                .adjustments(List.of(cutNegative))
                .build();

        SimulationResultResponse response = fundSimulationService.evaluateScenario(testUser, request);

        assertThat(response).isNotNull();
        assertThat(Boolean.TRUE.equals(response.getIsValidScenario())).isFalse();
        assertThat(response.getValidationMessages()).anyMatch(msg -> msg.contains("cannot be adjusted below ₹0 Lakhs"));
    }
}
