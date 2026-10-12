package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.ReportPreviewResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.ProjectStatus;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportPreviewResponse generateReportPreview(
            String reportType,
            Long stateId,
            Long districtId,
            LocalDate fromDate,
            LocalDate toDate,
            UserPrincipal currentUser) {

        List<Project> scopedProjects = getScopedProjects(currentUser, stateId, districtId);

        String normType = reportType != null ? reportType.toUpperCase() : "PROJECT_SUMMARY";
        String title;
        List<String> columns;
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Object> metrics = new HashMap<>();

        double totalSanctioned = scopedProjects.stream().mapToDouble(p -> p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0).sum();
        double totalReleased = scopedProjects.stream().mapToDouble(p -> p.getReleasedAmount() != null ? p.getReleasedAmount() : 0.0).sum();
        double totalExpenditure = scopedProjects.stream().mapToDouble(p -> p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0).sum();
        double overallUtil = totalReleased > 0 ? Math.round((totalExpenditure / totalReleased * 100.0) * 10.0) / 10.0 : 0.0;

        metrics.put("totalRecords", scopedProjects.size());
        metrics.put("totalSanctionedCr", Math.round((totalSanctioned / 100.0) * 100.0) / 100.0);
        metrics.put("totalExpenditureCr", Math.round((totalExpenditure / 100.0) * 100.0) / 100.0);
        metrics.put("overallUtilizationPercent", overallUtil);

        switch (normType) {
            case "FUND_UTILIZATION":
                title = "MPLADS Fund Utilization Audit Report";
                columns = List.of("Project ID", "Project Name", "State", "Sanctioned (₹ Lakhs)", "Released (₹ Lakhs)", "Expenditure (₹ Lakhs)", "Utilization %", "Unspent Balance");
                for (Project p : scopedProjects) {
                    double rel = p.getReleasedAmount() != null ? p.getReleasedAmount() : 0.0;
                    double exp = p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0;
                    double u = rel > 0 ? Math.round((exp / rel * 100.0) * 10.0) / 10.0 : 0.0;
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "state", p.getState() != null ? p.getState().getName() : "-",
                            "sanctioned", p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0,
                            "released", rel,
                            "expenditure", exp,
                            "utilization", u + "%",
                            "unspent", Math.max(0, Math.round((rel - exp) * 100.0) / 100.0)
                    ));
                }
                break;

            case "DELAYED_PROJECTS":
                title = "Delayed & Overdue Projects Monitoring Report";
                columns = List.of("Project ID", "Project Name", "Agency", "Expected Date", "Delay (Days)", "Physical %", "Financial %", "Risk Reason");
                List<Project> delayedList = scopedProjects.stream()
                        .filter(p -> p.getStatus() == ProjectStatus.DELAYED || (p.getDelayDays() != null && p.getDelayDays() > 0))
                        .collect(Collectors.toList());
                metrics.put("delayedCount", delayedList.size());
                for (Project p : delayedList) {
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "agency", p.getImplementingAgency() != null ? p.getImplementingAgency() : "-",
                            "expectedDate", p.getExpectedCompletionDate() != null ? p.getExpectedCompletionDate().toString() : "-",
                            "delayDays", p.getDelayDays() != null ? p.getDelayDays() : 0,
                            "physicalProgress", (p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0) + "%",
                            "financialProgress", (p.getFinancialProgress() != null ? p.getFinancialProgress() : 0.0) + "%",
                            "riskReason", p.getRiskReason() != null ? p.getRiskReason() : "Milestone schedule overrun"
                    ));
                }
                break;

            case "RISK_REPORTS":
                title = "High Risk & Anomaly Flagged Projects Dossier";
                columns = List.of("Project ID", "Project Name", "Risk Severity", "Risk Score", "Physical %", "Utilization %", "Anomaly Trigger Details");
                List<Project> riskList = scopedProjects.stream()
                        .filter(p -> "HIGH".equalsIgnoreCase(p.getRiskLevel()) || "ANOMALY_FLAGGED".equalsIgnoreCase(p.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(p.getRiskLevel()))
                        .collect(Collectors.toList());
                metrics.put("flaggedCount", riskList.size());
                for (Project p : riskList) {
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "riskSeverity", p.getRiskLevel() != null ? p.getRiskLevel() : "HIGH",
                            "riskScore", p.getRiskScore() != null ? p.getRiskScore() : 75.0,
                            "physicalProgress", (p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0) + "%",
                            "utilization", p.calculateUtilization() + "%",
                            "triggerDetails", p.getRiskReason() != null ? p.getRiskReason() : "Desynchronization between expenditure and site milestones"
                    ));
                }
                break;

            case "PROGRESS":
                title = "Physical & Financial Execution Progress Report";
                columns = List.of("Project ID", "Project Name", "Category", "Status", "Physical %", "Financial %", "Start Date", "Expected Date");
                for (Project p : scopedProjects) {
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "category", p.getCategoryName() != null ? p.getCategoryName() : "-",
                            "status", p.getStatus() != null ? p.getStatus().name() : "-",
                            "physicalProgress", (p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0) + "%",
                            "financialProgress", (p.getFinancialProgress() != null ? p.getFinancialProgress() : 0.0) + "%",
                            "startDate", p.getStartDate() != null ? p.getStartDate().toString() : "-",
                            "expectedDate", p.getExpectedCompletionDate() != null ? p.getExpectedCompletionDate().toString() : "-"
                    ));
                }
                break;

            case "EXPENDITURE":
                title = "Component-Wise Expenditure Statement";
                columns = List.of("Project ID", "Project Name", "Implementing Agency", "Sanctioned (₹ Lakhs)", "Disbursed (₹ Lakhs)", "Status");
                for (Project p : scopedProjects) {
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "agency", p.getImplementingAgency() != null ? p.getImplementingAgency() : "-",
                            "sanctioned", p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0,
                            "disbursed", p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0,
                            "status", p.getStatus() != null ? p.getStatus().name() : "-"
                    ));
                }
                break;

            case "PROJECT_SUMMARY":
            default:
                title = "Comprehensive MPLADS Master Projects Summary";
                columns = List.of("Project ID", "Project Name", "State", "District", "Category", "Sanctioned (₹ L)", "Physical %", "Status", "Risk");
                for (Project p : scopedProjects) {
                    rows.add(Map.of(
                            "projectId", p.getProjectId(),
                            "projectName", p.getProjectName(),
                            "state", p.getState() != null ? p.getState().getName() : "-",
                            "district", p.getDistrict() != null ? p.getDistrict().getName() : "-",
                            "category", p.getCategoryName() != null ? p.getCategoryName() : "-",
                            "sanctioned", p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0,
                            "physicalProgress", (p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0) + "%",
                            "status", p.getStatus() != null ? p.getStatus().name() : "-",
                            "risk", p.getRiskLevel() != null ? p.getRiskLevel() : "LOW"
                    ));
                }
                break;
        }

        return ReportPreviewResponse.builder()
                .reportType(normType)
                .title(title)
                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")))
                .scope(currentUser.getRole())
                .summaryMetrics(metrics)
                .columns(columns)
                .rows(rows)
                .build();
    }

    private List<Project> getScopedProjects(UserPrincipal currentUser, Long stateId, Long districtId) {
        String role = currentUser.getRole();
        if ("ROLE_STATE_NODAL_AUTHORITY".equals(role) && currentUser.getStateId() != null) {
            return projectRepository.findByStateId(currentUser.getStateId());
        }
        if ("ROLE_DISTRICT_AUTHORITY".equals(role) && currentUser.getDistrictId() != null) {
            return projectRepository.findByDistrictId(currentUser.getDistrictId());
        }
        if ("ROLE_MP".equals(role) && currentUser.getConstituencyId() != null) {
            return projectRepository.findByConstituencyId(currentUser.getConstituencyId());
        }
        if (stateId != null) {
            return projectRepository.findByStateId(stateId);
        }
        if (districtId != null) {
            return projectRepository.findByDistrictId(districtId);
        }
        return projectRepository.findAll();
    }
}
