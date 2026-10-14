package com.mplads.monitoring.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mplads.monitoring.dto.response.*;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.exception.AppException;
import com.mplads.monitoring.repository.*;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AiClientService;
import com.mplads.monitoring.service.RiskAlertService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RiskAlertServiceImpl implements RiskAlertService {

    private final RiskAlertRepository riskAlertRepository;
    private final ProjectRepository projectRepository;
    private final InvestigationRepository investigationRepository;
    private final InvestigationNoteRepository investigationNoteRepository;
    private final AuditLogRepository auditLogRepository;
    private final AiClientService aiClientService;
    private final ObjectMapper objectMapper;

    public RiskAlertServiceImpl(
            RiskAlertRepository riskAlertRepository,
            ProjectRepository projectRepository,
            InvestigationRepository investigationRepository,
            InvestigationNoteRepository investigationNoteRepository,
            AuditLogRepository auditLogRepository,
            AiClientService aiClientService,
            ObjectMapper objectMapper) {
        this.riskAlertRepository = riskAlertRepository;
        this.projectRepository = projectRepository;
        this.investigationRepository = investigationRepository;
        this.investigationNoteRepository = investigationNoteRepository;
        this.auditLogRepository = auditLogRepository;
        this.aiClientService = aiClientService;
        this.objectMapper = objectMapper;
    }


    @Override
    @Transactional(readOnly = true)
    public PagedResponse<RiskAlertResponse> getAlerts(
            String severity,
            String alertType,
            String status,
            Long stateId,
            Long districtId,
            String search,
            UserPrincipal currentUser,
            Pageable pageable
    ) {
        Specification<RiskAlert> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<RiskAlert, Project> projectJoin = root.join("project");

            // Role-based scoping
            if ("ROLE_STATE_NODAL_AUTHORITY".equals(currentUser.getRole()) && currentUser.getStateId() != null) {
                predicates.add(cb.equal(projectJoin.get("state").get("id"), currentUser.getStateId()));
            } else if ("ROLE_DISTRICT_AUTHORITY".equals(currentUser.getRole()) && currentUser.getDistrictId() != null) {
                predicates.add(cb.equal(projectJoin.get("district").get("id"), currentUser.getDistrictId()));
            } else if ("ROLE_MP".equals(currentUser.getRole()) && currentUser.getConstituencyId() != null) {
                predicates.add(cb.equal(projectJoin.get("constituency").get("id"), currentUser.getConstituencyId()));
            } else {
                if (stateId != null) {
                    predicates.add(cb.equal(projectJoin.get("state").get("id"), stateId));
                }
                if (districtId != null) {
                    predicates.add(cb.equal(projectJoin.get("district").get("id"), districtId));
                }
            }

            if (severity != null && !severity.isBlank() && !"ALL".equalsIgnoreCase(severity)) {
                predicates.add(cb.equal(cb.upper(root.get("severity")), severity.toUpperCase()));
            }

            if (alertType != null && !alertType.isBlank() && !"ALL".equalsIgnoreCase(alertType)) {
                predicates.add(cb.equal(cb.upper(root.get("alertType")), alertType.toUpperCase()));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.toUpperCase()));
            }

            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase().trim() + "%";
                Predicate searchTitle = cb.like(cb.lower(root.get("title")), term);
                Predicate searchDesc = cb.like(cb.lower(root.get("description")), term);
                Predicate searchProjCode = cb.like(cb.lower(projectJoin.get("projectId")), term);
                Predicate searchProjName = cb.like(cb.lower(projectJoin.get("projectName")), term);
                predicates.add(cb.or(searchTitle, searchDesc, searchProjCode, searchProjName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<RiskAlert> alertPage = riskAlertRepository.findAll(spec, pageable);
        List<RiskAlertResponse> content = alertPage.getContent().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());

        return PagedResponse.<RiskAlertResponse>builder()
                .content(content)
                .page(alertPage.getNumber())
                .size(alertPage.getSize())
                .totalElements(alertPage.getTotalElements())
                .totalPages(alertPage.getTotalPages())
                .first(alertPage.isFirst())
                .last(alertPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RiskAlertResponse getAlertById(Long alertId, UserPrincipal currentUser) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Risk alert not found with ID: " + alertId));

        validateScope(alert.getProject(), currentUser);
        return mapToAlertResponse(alert);
    }

    @Override
    @Transactional
    public RiskAlertResponse updateStatus(Long alertId, String newStatus, String resolutionNotes, UserPrincipal currentUser) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Risk alert not found with ID: " + alertId));

        validateScope(alert.getProject(), currentUser);

        String oldStatus = alert.getStatus();
        alert.setStatus(newStatus.toUpperCase());

        if ("RESOLVED".equalsIgnoreCase(newStatus) || "DISMISSED".equalsIgnoreCase(newStatus)) {
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(currentUser.getFullName() + " (" + currentUser.getRole() + ")");
        }

        riskAlertRepository.save(alert);

        // Ensure investigation case is updated
        Optional<Investigation> invOpt = investigationRepository.findByRiskAlertId(alert.getId());
        Investigation inv = invOpt.orElseGet(() -> {
            Investigation newInv = Investigation.builder()
                    .project(alert.getProject())
                    .riskAlert(alert)
                    .caseNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", alert.getId()))
                    .status("IN_PROGRESS")
                    .priority(alert.getSeverity())
                    .assignedDate(LocalDate.now())
                    .build();
            return investigationRepository.save(newInv);
        });

        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            InvestigationNote note = InvestigationNote.builder()
                    .investigation(inv)
                    .authorName(currentUser.getFullName())
                    .authorRole(currentUser.getRole())
                    .noteText(String.format("Status changed from %s to %s. Note: %s", oldStatus, newStatus, resolutionNotes))
                    .build();
            investigationNoteRepository.save(note);
        }

        // Audit Trail
        auditLogRepository.save(AuditLog.builder()
                .action("RISK_ALERT_STATUS_UPDATE")
                .performedBy(currentUser.getFullName())
                .userRole(currentUser.getRole())
                .details(String.format("Updated alert #%d on project %s from %s to %s.", alertId, alert.getProject().getProjectId(), oldStatus, newStatus))
                .status("SUCCESS")
                .build());

        return mapToAlertResponse(alert);
    }

    @Override
    @Transactional
    public RiskAlertResponse assignAlert(Long alertId, String assigneeName, UserPrincipal currentUser) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Risk alert not found with ID: " + alertId));

        validateScope(alert.getProject(), currentUser);

        alert.setAssignedTo(assigneeName);
        if ("NEW".equalsIgnoreCase(alert.getStatus())) {
            alert.setStatus("UNDER_REVIEW");
        }
        riskAlertRepository.save(alert);

        Investigation inv = investigationRepository.findByRiskAlertId(alert.getId()).orElseGet(() -> {
            Investigation newInv = Investigation.builder()
                    .project(alert.getProject())
                    .riskAlert(alert)
                    .caseNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", alert.getId()))
                    .status("ASSIGNED")
                    .priority(alert.getSeverity())
                    .assignedDate(LocalDate.now())
                    .build();
            return investigationRepository.save(newInv);
        });

        inv.setInvestigatorName(assigneeName);
        investigationRepository.save(inv);

        InvestigationNote note = InvestigationNote.builder()
                .investigation(inv)
                .authorName(currentUser.getFullName())
                .authorRole(currentUser.getRole())
                .noteText(String.format("Assigned alert to %s for detailed physical/financial verification.", assigneeName))
                .build();
        investigationNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .action("RISK_ALERT_ASSIGNMENT")
                .performedBy(currentUser.getFullName())
                .userRole(currentUser.getRole())
                .details(String.format("Assigned alert #%d (Project %s) to %s.", alertId, alert.getProject().getProjectId(), assigneeName))
                .status("SUCCESS")
                .build());

        return mapToAlertResponse(alert);
    }

    @Override
    @Transactional
    public RiskAlertResponse addInvestigationNote(Long alertId, String noteText, UserPrincipal currentUser) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Risk alert not found with ID: " + alertId));

        validateScope(alert.getProject(), currentUser);

        Investigation inv = investigationRepository.findByRiskAlertId(alert.getId()).orElseGet(() -> {
            Investigation newInv = Investigation.builder()
                    .project(alert.getProject())
                    .riskAlert(alert)
                    .caseNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", alert.getId()))
                    .status("IN_PROGRESS")
                    .priority(alert.getSeverity())
                    .assignedDate(LocalDate.now())
                    .build();
            return investigationRepository.save(newInv);
        });

        InvestigationNote note = InvestigationNote.builder()
                .investigation(inv)
                .authorName(currentUser.getFullName())
                .authorRole(currentUser.getRole())
                .noteText(noteText)
                .build();
        investigationNoteRepository.save(note);

        if ("NEW".equalsIgnoreCase(alert.getStatus())) {
            alert.setStatus("INVESTIGATING");
            riskAlertRepository.save(alert);
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ADD_INVESTIGATION_NOTE")
                .performedBy(currentUser.getFullName())
                .userRole(currentUser.getRole())
                .details(String.format("Added investigation note to alert #%d on project %s.", alertId, alert.getProject().getProjectId()))
                .status("SUCCESS")
                .build());

        return mapToAlertResponse(alert);
    }

    @Override
    @Transactional
    public RiskAlertResponse escalateAlert(Long alertId, String escalationReason, UserPrincipal currentUser) {
        RiskAlert alert = riskAlertRepository.findById(alertId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Risk alert not found with ID: " + alertId));

        validateScope(alert.getProject(), currentUser);

        alert.setSeverity("CRITICAL");
        alert.setStatus("INVESTIGATING");
        riskAlertRepository.save(alert);

        Investigation inv = investigationRepository.findByRiskAlertId(alert.getId()).orElseGet(() -> {
            Investigation newInv = Investigation.builder()
                    .project(alert.getProject())
                    .riskAlert(alert)
                    .caseNumber("INV-" + LocalDate.now().getYear() + "-" + String.format("%04d", alert.getId()))
                    .status("IN_PROGRESS")
                    .priority("URGENT")
                    .assignedDate(LocalDate.now())
                    .build();
            return investigationRepository.save(newInv);
        });

        inv.setPriority("URGENT");
        investigationRepository.save(inv);

        InvestigationNote note = InvestigationNote.builder()
                .investigation(inv)
                .authorName(currentUser.getFullName())
                .authorRole(currentUser.getRole())
                .noteText(String.format("ESCALATED TO CRITICAL: %s", escalationReason))
                .build();
        investigationNoteRepository.save(note);

        auditLogRepository.save(AuditLog.builder()
                .action("RISK_ALERT_ESCALATION")
                .performedBy(currentUser.getFullName())
                .userRole(currentUser.getRole())
                .details(String.format("Escalated alert #%d (Project %s) to CRITICAL severity.", alertId, alert.getProject().getProjectId()))
                .status("SUCCESS")
                .build());

        return mapToAlertResponse(alert);
    }

    @Override
    @Transactional
    public AiAnalysisPreviewResponse analyzeProjectOnDemand(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Project not found with ID: " + projectId));

        validateScope(project, currentUser);

        AiAnalysisPreviewResponse aiResult = aiClientService.evaluateProject(project);

        int newRiskScore = aiResult.getAnomalyRiskScore() != null ? aiResult.getAnomalyRiskScore().intValue() : 15;
        String newRiskLevel = aiResult.getRiskClassification() != null ? aiResult.getRiskClassification() : "LOW";

        project.setRiskScore((double) newRiskScore);
        project.setRiskLevel(newRiskLevel);
        project.setRiskReason(aiResult.getAnomalyIndicators().isEmpty() ? "Standard execution" : aiResult.getAnomalyIndicators().get(0).getExplanation());
        projectRepository.save(project);

        // If high/critical risk score, create or update an active alert
        if (newRiskScore >= 40) {
            List<RiskAlert> existingAlerts = riskAlertRepository.findByProjectId(project.getId());
            Optional<RiskAlert> openAlert = existingAlerts.stream()
                    .filter(a -> !"RESOLVED".equals(a.getStatus()) && !"DISMISSED".equals(a.getStatus()))
                    .findFirst();

            String primaryReason = aiResult.getAnomalyIndicators().isEmpty() ? "Potential milestone risk" : aiResult.getAnomalyIndicators().get(0).getExplanation();
            String alertType = "PROGRESS_FINANCIAL_MISMATCH";
            if (primaryReason.contains("Cost Anomaly")) alertType = "POTENTIAL_COST_ANOMALY";
            else if (primaryReason.contains("delayed") || primaryReason.contains("Delay")) alertType = "DELAY_EXCEEDED";

            if (openAlert.isPresent()) {
                RiskAlert alert = openAlert.get();
                alert.setRiskScore(newRiskScore);
                alert.setSeverity(newRiskLevel);
                alert.setTitle("Potential Anomaly Flagged by AI Engine");
                alert.setDescription(primaryReason);
                alert.setTriggerRule("AI_ISOLATION_FOREST_V2");
                riskAlertRepository.save(alert);
            } else {
                RiskAlert newAlert = RiskAlert.builder()
                        .project(project)
                        .alertType(alertType)
                        .severity(newRiskLevel)
                        .riskScore(newRiskScore)
                        .title("Potential Anomaly Flagged by AI Engine")
                        .description(primaryReason)
                        .triggerRule("AI_ISOLATION_FOREST_V2")
                        .status("NEW")
                        .assignedTo(project.getDistrict() != null ? project.getDistrict().getName() + " Authority" : "State Nodal Authority")
                        .build();
                riskAlertRepository.save(newAlert);
            }
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ON_DEMAND_AI_INFERENCE")
                .performedBy(currentUser.getFullName())
                .userRole(currentUser.getRole())
                .details(String.format("Triggered on-demand AI telemetry for Project %s. Score: %d, Tier: %s.", project.getProjectId(), newRiskScore, newRiskLevel))
                .status("SUCCESS")
                .build());

        return aiResult;
    }

    @Override
    @Transactional(readOnly = true)
    public AiMonitoringSummaryResponse getMonitoringSummary(UserPrincipal currentUser) {
        Specification<Project> pSpec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if ("ROLE_STATE_NODAL_AUTHORITY".equals(currentUser.getRole()) && currentUser.getStateId() != null) {
                predicates.add(cb.equal(root.get("state").get("id"), currentUser.getStateId()));
            } else if ("ROLE_DISTRICT_AUTHORITY".equals(currentUser.getRole()) && currentUser.getDistrictId() != null) {
                predicates.add(cb.equal(root.get("district").get("id"), currentUser.getDistrictId()));
            } else if ("ROLE_MP".equals(currentUser.getRole()) && currentUser.getConstituencyId() != null) {
                predicates.add(cb.equal(root.get("constituency").get("id"), currentUser.getConstituencyId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Project> scopedProjects = projectRepository.findAll(pSpec);

        long lowCount = 0, medCount = 0, highCount = 0, critCount = 0;
        long costAnomCount = 0, duplicateCount = 0, delayedCount = 0, paymentAnomCount = 0, progressMismatchCount = 0;
        double sumRiskScore = 0.0;

        for (Project p : scopedProjects) {
            double score = p.getRiskScore() != null ? p.getRiskScore() : 15.0;
            sumRiskScore += score;

            if (score >= 80) critCount++;
            else if (score >= 60) highCount++;
            else if (score >= 30) medCount++;
            else lowCount++;

            double sanctioned = p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0;
            double released = p.getReleasedAmount() != null ? p.getReleasedAmount() : 0.0;
            double exp = p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0;
            int phys = p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0;
            double fin = p.getFinancialProgress() != null ? p.getFinancialProgress() : (released > 0 ? (exp / released * 100) : 0.0);

            if (sanctioned > 75.0) costAnomCount++;
            if (fin - phys >= 25.0 && exp > 5.0) progressMismatchCount++;
            if (p.getDelayDays() != null && p.getDelayDays() > 60) delayedCount++;
            if (score >= 70) paymentAnomCount++;
        }

        double avgScore = scopedProjects.isEmpty() ? 0.0 : Math.round((sumRiskScore / scopedProjects.size()) * 10.0) / 10.0;

        List<Map<String, Object>> riskScoreDistribution = List.of(
                Map.of("tier", "LOW", "count", lowCount, "color", "#10B981", "label", "Low Risk (0-29)"),
                Map.of("tier", "MEDIUM", "count", medCount, "color", "#3B82F6", "label", "Medium Risk (30-59)"),
                Map.of("tier", "HIGH", "count", highCount, "color", "#F59E0B", "label", "High Risk (60-79)"),
                Map.of("tier", "CRITICAL", "count", critCount, "color", "#EF4444", "label", "Critical (80-100)")
        );

        List<Map<String, Object>> anomalyBreakdown = List.of(
                Map.of("category", "Progress / Expenditure Mismatch", "count", progressMismatchCount),
                Map.of("category", "Potential Cost Anomalies", "count", costAnomCount),
                Map.of("category", "Milestone Execution Delays", "count", delayedCount),
                Map.of("category", "Payment Drawdown Anomalies", "count", paymentAnomCount),
                Map.of("category", "Potential Duplicate Works", "count", duplicateCount)
        );

        // Top high risk projects
        List<ProjectResponse> topProjects = scopedProjects.stream()
                .sorted((a, b) -> Double.compare(b.getRiskScore() != null ? b.getRiskScore() : 0, a.getRiskScore() != null ? a.getRiskScore() : 0))
                .limit(8)
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());

        // Recent alerts
        List<RiskAlertResponse> recentAlerts = riskAlertRepository.findTop10ByOrderByDetectedAtDesc().stream()
                .filter(a -> isProjectInScope(a.getProject(), currentUser))
                .limit(6)
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());

        return AiMonitoringSummaryResponse.builder()
                .totalFlaggedAlerts(highCount + critCount)
                .lowRiskCount(lowCount)
                .mediumRiskCount(medCount)
                .highRiskCount(highCount)
                .criticalRiskCount(critCount)
                .costAnomaliesCount(costAnomCount)
                .duplicateRiskCount(duplicateCount)
                .delayedProjectsCount(delayedCount)
                .paymentAnomaliesCount(paymentAnomCount)
                .progressMismatchCount(progressMismatchCount)
                .averageRiskScore(avgScore)
                .riskScoreDistribution(riskScoreDistribution)
                .anomalyTypeBreakdown(anomalyBreakdown)
                .topHighRiskProjects(topProjects)
                .recentAlerts(recentAlerts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> checkDuplicates(Long projectId, UserPrincipal currentUser) {
        Project target = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Target project not found"));

        validateScope(target, currentUser);

        List<Project> candidates;
        if (target.getDistrict() != null) {
            candidates = projectRepository.findByDistrictId(target.getDistrict().getId());
        } else {
            candidates = projectRepository.findAll();
        }

        return aiClientService.detectDuplicates(target, candidates);
    }

    private RiskAlertResponse mapToAlertResponse(RiskAlert alert) {
        Project p = alert.getProject();
        List<String> reasonsList = new ArrayList<>();
        if (alert.getDescription() != null && !alert.getDescription().isBlank()) {
            reasonsList.add(alert.getDescription());
        }

        InvestigationResponse invResp = null;
        Optional<Investigation> invOpt = investigationRepository.findByRiskAlertId(alert.getId());
        if (invOpt.isPresent()) {
            Investigation inv = invOpt.get();
            List<InvestigationNote> notes = investigationNoteRepository.findByInvestigationIdOrderByCreatedAtAsc(inv.getId());
            invResp = InvestigationResponse.builder()
                    .id(inv.getId())
                    .projectId(p.getId())
                    .projectCode(p.getProjectId())
                    .projectName(p.getProjectName())
                    .riskAlertId(alert.getId())
                    .caseNumber(inv.getCaseNumber())
                    .investigatorName(inv.getInvestigatorName())
                    .status(inv.getStatus())
                    .priority(inv.getPriority())
                    .assignedDate(inv.getAssignedDate())
                    .completionDate(inv.getCompletionDate())
                    .findingsSummary(inv.getFindingsSummary())
                    .notes(notes.stream().map(n -> InvestigationResponse.InvestigationNoteDto.builder()
                            .id(n.getId())
                            .authorName(n.getAuthorName())
                            .authorRole(n.getAuthorRole())
                            .noteText(n.getNoteText())
                            .createdAt(n.getCreatedAt())
                            .build()).collect(Collectors.toList()))
                    .build();
        }

        return RiskAlertResponse.builder()
                .id(alert.getId())
                .projectId(p.getId())
                .projectCode(p.getProjectId())
                .projectName(p.getProjectName())
                .stateName(p.getState() != null ? p.getState().getName() : "Unknown")
                .districtName(p.getDistrict() != null ? p.getDistrict().getName() : "Unknown")
                .categoryName(p.getCategoryName() != null ? p.getCategoryName() : "General")
                .sanctionedAmount(p.getSanctionedAmount())
                .physicalProgress(p.getPhysicalProgress())
                .financialProgress(p.getFinancialProgress())
                .riskScore(alert.getRiskScore() != null ? alert.getRiskScore() : (p.getRiskScore() != null ? p.getRiskScore().intValue() : 50))
                .alertType(alert.getAlertType())
                .severity(alert.getSeverity())
                .title(alert.getTitle())
                .description(alert.getDescription())
                .reasons(reasonsList)
                .triggerRule(alert.getTriggerRule())
                .status(alert.getStatus())
                .assignedTo(alert.getAssignedTo() != null ? alert.getAssignedTo() : (p.getDistrict() != null ? p.getDistrict().getName() + " Authority" : "State Authority"))
                .detectedAt(alert.getDetectedAt())
                .resolvedAt(alert.getResolvedAt())
                .resolvedBy(alert.getResolvedBy())
                .investigation(invResp)
                .build();
    }

    private ProjectResponse mapToProjectResponse(Project p) {
        String mpDisplay = p.getMpUser() != null ? p.getMpUser().getFullName() : p.getMpName();
        return ProjectResponse.builder()
                .id(p.getId())
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .stateId(p.getState() != null ? p.getState().getId() : null)
                .stateName(p.getState() != null ? p.getState().getName() : null)
                .districtId(p.getDistrict() != null ? p.getDistrict().getId() : null)
                .districtName(p.getDistrict() != null ? p.getDistrict().getName() : null)
                .constituencyId(p.getConstituency() != null ? p.getConstituency().getId() : null)
                .constituencyName(p.getConstituency() != null ? p.getConstituency().getName() : null)
                .mpName(mpDisplay)
                .implementingAgency(p.getImplementingAgency())
                .categoryName(p.getCategoryName())
                .sanctionedAmount(p.getSanctionedAmount())
                .releasedAmount(p.getReleasedAmount())
                .expenditureAmount(p.getExpenditureAmount())
                .startDate(p.getStartDate())
                .expectedCompletionDate(p.getExpectedCompletionDate())
                .actualCompletionDate(p.getActualCompletionDate())
                .physicalProgress(p.getPhysicalProgress())
                .financialProgress(p.getFinancialProgress())
                .status(p.getStatus() != null ? p.getStatus().name() : "ONGOING")
                .riskLevel(p.getRiskLevel())
                .riskScore(p.getRiskScore())
                .delayDays(p.getDelayDays())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private boolean isProjectInScope(Project project, UserPrincipal currentUser) {
        if ("ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) return true;
        if ("ROLE_STATE_NODAL_AUTHORITY".equals(currentUser.getRole())) {
            return project.getState() != null && project.getState().getId().equals(currentUser.getStateId());
        }
        if ("ROLE_DISTRICT_AUTHORITY".equals(currentUser.getRole())) {
            return project.getDistrict() != null && project.getDistrict().getId().equals(currentUser.getDistrictId());
        }
        if ("ROLE_MP".equals(currentUser.getRole())) {
            return project.getConstituency() != null && project.getConstituency().getId().equals(currentUser.getConstituencyId());
        }
        return true;
    }

    private void validateScope(Project project, UserPrincipal currentUser) {
        if (!isProjectInScope(project, currentUser)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Access denied: Project is outside your assigned administrative jurisdiction.");
        }
    }
}
