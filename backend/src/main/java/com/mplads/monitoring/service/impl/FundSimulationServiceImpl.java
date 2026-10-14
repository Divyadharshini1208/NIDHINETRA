package com.mplads.monitoring.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mplads.monitoring.dto.request.SimulationAdjustmentItem;
import com.mplads.monitoring.dto.request.SimulationEvaluateRequest;
import com.mplads.monitoring.dto.response.SimulationResultResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.SimulationScenario;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.repository.SimulationScenarioRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuditLogService;
import com.mplads.monitoring.service.FundSimulationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
public class FundSimulationServiceImpl implements FundSimulationService {

    private final ProjectRepository projectRepository;
    private final SimulationScenarioRepository simulationScenarioRepository;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public FundSimulationServiceImpl(
            ProjectRepository projectRepository,
            SimulationScenarioRepository simulationScenarioRepository,
            AuditLogService auditLogService,
            ObjectMapper objectMapper) {
        this.projectRepository = projectRepository;
        this.simulationScenarioRepository = simulationScenarioRepository;
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }


    private static final String STATUTORY_NOTICE = 
            "Policy Simulation Only: This tool models hypothetical reallocations and does not execute financial transactions or modify sanctioned project ledgers.";

    @Override
    @Transactional(readOnly = true)
    public SimulationResultResponse evaluateScenario(UserPrincipal currentUser, SimulationEvaluateRequest request) {
        return runSimulationEngine(currentUser, request, false);
    }

    @Override
    @Transactional
    public SimulationResultResponse saveScenario(UserPrincipal currentUser, SimulationEvaluateRequest request) {
        SimulationResultResponse evaluated = runSimulationEngine(currentUser, request, true);

        try {
            String payloadJson = objectMapper.writeValueAsString(request.getAdjustments());
            String metricsJson = objectMapper.writeValueAsString(evaluated.getSimulatedProjectDeltas());

            SimulationScenario scenario = SimulationScenario.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .scopeType(request.getScopeType() != null ? request.getScopeType() : "DISTRICT")
                    .scopeId(request.getScopeId())
                    .totalOriginalBudgetCr(evaluated.getTotalOriginalBudgetCr())
                    .totalHypotheticalBudgetCr(evaluated.getTotalHypotheticalBudgetCr())
                    .reallocatedAmountCr(evaluated.getNetReallocatedCr())
                    .projectsAdjustedCount(evaluated.getProjectsAdjustedCount())
                    .projectedBeneficiaryImpact(evaluated.getProjectedBeneficiaryImpact())
                    .projectedTimelineDeltaMonths(evaluated.getProjectedTimelineDeltaMonths())
                    .scenarioPayloadJson(payloadJson)
                    .metricsSummaryJson(metricsJson)
                    .createdByUserId(currentUser != null ? currentUser.getId() : null)
                    .createdByName(currentUser != null ? currentUser.getFullName() : "Author")
                    .build();

            SimulationScenario saved = simulationScenarioRepository.save(scenario);
            evaluated.setId(saved.getId());

            auditLogService.logAction(
                    "SAVE_FUND_SIMULATION",
                    currentUser != null ? currentUser.getUsername() : "SYSTEM",
                    currentUser != null ? currentUser.getRole() : "USER",
                    "Saved What-If Fund Simulation Scenario: " + request.getTitle(),
                    "INTERNAL",
                    "SUCCESS"
            );
        } catch (Exception e) {
            log.error("Error saving simulation scenario: {}", e.getMessage(), e);
        }

        return evaluated;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SimulationResultResponse> getSavedScenarios(UserPrincipal currentUser) {
        List<SimulationScenario> scenarios;
        if (currentUser != null && !"ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) {
            scenarios = simulationScenarioRepository.findByCreatedByUserIdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            scenarios = simulationScenarioRepository.findTop10ByOrderByCreatedAtDesc();
        }

        List<SimulationResultResponse> list = new ArrayList<>();
        for (SimulationScenario s : scenarios) {
            list.add(SimulationResultResponse.builder()
                    .id(s.getId())
                    .title(s.getTitle())
                    .description(s.getDescription())
                    .scopeType(s.getScopeType())
                    .scopeId(s.getScopeId())
                    .totalOriginalBudgetCr(s.getTotalOriginalBudgetCr())
                    .totalHypotheticalBudgetCr(s.getTotalHypotheticalBudgetCr())
                    .netReallocatedCr(s.getReallocatedAmountCr())
                    .projectsAdjustedCount(s.getProjectsAdjustedCount())
                    .projectedBeneficiaryImpact(s.getProjectedBeneficiaryImpact())
                    .projectedTimelineDeltaMonths(s.getProjectedTimelineDeltaMonths())
                    .isValidScenario(true)
                    .validationMessages(List.of("Historical scenario retrieved."))
                    .statutoryNotice(STATUTORY_NOTICE)
                    .build());
        }
        return list;
    }

    private SimulationResultResponse runSimulationEngine(
            UserPrincipal currentUser, 
            SimulationEvaluateRequest request, 
            boolean isPersisting) {

        List<String> validationMessages = new ArrayList<>();
        List<Map<String, Object>> deltas = new ArrayList<>();

        double totalOriginalLakhs = 0.0;
        double totalHypotheticalLakhs = 0.0;
        double totalReallocatedLakhs = 0.0;
        int beneficiaryImpact = 0;
        double timelineDeltaAcc = 0.0;

        for (SimulationAdjustmentItem item : request.getAdjustments()) {
            Optional<Project> opt = projectRepository.findById(item.getProjectId());
            if (opt.isEmpty()) {
                validationMessages.add("Project with ID " + item.getProjectId() + " not found.");
                continue;
            }

            Project p = opt.get();
            double originalSanctioned = p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0;
            double delta = item.getAdjustmentDeltaLakhs();
            double hypotheticalSanctioned = originalSanctioned + delta;

            totalOriginalLakhs += originalSanctioned;
            totalHypotheticalLakhs += hypotheticalSanctioned;
            totalReallocatedLakhs += Math.abs(delta);

            if (hypotheticalSanctioned < 0.0) {
                validationMessages.add(String.format("Invalid negative allocation: Project %s cannot be adjusted below ₹0 Lakhs.",
                        p.getProjectId()));
            }

            double expended = p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0;
            if (hypotheticalSanctioned < expended) {
                validationMessages.add(String.format("Invalid constraint: Hypothetical budget (₹%.2f L) for %s is less than already expended funds (₹%.2f L).",
                        hypotheticalSanctioned, p.getProjectId(), expended));
            }

            // Estimate sector-specific beneficiary factor (beneficiaries per Lakh INR)
            String sector = p.getCategoryName() != null ? p.getCategoryName() : "General Infrastructure";
            double factor = getSectorBeneficiaryFactor(sector);
            int itemBeneficiaries = (int) (delta * factor);
            beneficiaryImpact += itemBeneficiaries;

            // Estimate delivery timeline change (months)
            double itemTimelineImpact = estimateTimelineImpactMonths(sector, delta);
            timelineDeltaAcc += itemTimelineImpact;

            Map<String, Object> deltaMap = new LinkedHashMap<>();
            deltaMap.put("projectId", p.getId());
            deltaMap.put("projectCode", p.getProjectId());
            deltaMap.put("projectName", p.getProjectName());
            deltaMap.put("sector", sector);
            deltaMap.put("originalSanctionedLakhs", originalSanctioned);
            deltaMap.put("deltaLakhs", delta);
            deltaMap.put("hypotheticalSanctionedLakhs", hypotheticalSanctioned);
            deltaMap.put("estimatedBeneficiaryShift", itemBeneficiaries);
            deltaMap.put("estimatedTimelineMonthsShift", itemTimelineImpact);
            deltas.add(deltaMap);
        }

        double netReallocatedCr = (totalReallocatedLakhs / 2.0) / 100.0; // Halved to reflect bilateral reallocation
        double totalOriginalCr = totalOriginalLakhs / 100.0;
        double totalHypotheticalCr = totalHypotheticalLakhs / 100.0;

        boolean isValid = validationMessages.stream().noneMatch(m -> m.contains("Invalid"));

        return SimulationResultResponse.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .scopeType(request.getScopeType() != null ? request.getScopeType() : "DISTRICT")
                .scopeId(request.getScopeId())
                .totalOriginalBudgetCr(Math.round(totalOriginalCr * 100.0) / 100.0)
                .totalHypotheticalBudgetCr(Math.round(totalHypotheticalCr * 100.0) / 100.0)
                .netReallocatedCr(Math.round(netReallocatedCr * 100.0) / 100.0)
                .projectsAdjustedCount(request.getAdjustments().size())
                .projectedBeneficiaryImpact(Math.max(beneficiaryImpact, 0))
                .projectedTimelineDeltaMonths(Math.round(timelineDeltaAcc * 10.0) / 10.0)
                .isValidScenario(isValid)
                .validationMessages(validationMessages)
                .simulatedProjectDeltas(deltas)
                .statutoryNotice(STATUTORY_NOTICE)
                .build();
    }

    private double getSectorBeneficiaryFactor(String sector) {
        if (sector.contains("Water")) return 120.0; // 120 citizens per Lakh
        if (sector.contains("Health") || sector.contains("Sanitation")) return 95.0;
        if (sector.contains("Education") || sector.contains("School")) return 80.0;
        if (sector.contains("Road") || sector.contains("Bridge")) return 45.0;
        if (sector.contains("Energy") || sector.contains("Solar")) return 60.0;
        return 50.0;
    }

    private double estimateTimelineImpactMonths(String sector, double deltaLakhs) {
        // Shifting funds into fast-turnaround works (water/solar) reduces overall delivery lead time
        if (deltaLakhs > 0) {
            if (sector.contains("Water") || sector.contains("Energy")) return -0.4;
            if (sector.contains("Education")) return -0.2;
            if (sector.contains("Road")) return +0.3; // heavy civil works take longer
        }
        return 0.0;
    }
}
