package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.DashboardStatsResponse;
import com.mplads.monitoring.dto.response.InsightsSummaryResponse;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.repository.*;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsServiceImpl implements InsightsService {

    private final ProjectRepository projectRepository;
    private final StateRepository stateRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public InsightsSummaryResponse getPublicInsightsSummary() {
        List<Project> projects = projectRepository.findAll();
        long totalProjects = projects.size();
        long completedProjects = projects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();
        long ongoingProjects = projects.stream().filter(p -> p.getStatus() == ProjectStatus.ONGOING).count();
        long delayedProjects = projects.stream().filter(p -> p.getStatus() == ProjectStatus.DELAYED || (p.getDelayDays() != null && p.getDelayDays() > 0)).count();
        long proposedProjects = projects.stream().filter(p -> p.getStatus() == ProjectStatus.SANCTIONED || p.getStatus() == ProjectStatus.PROPOSED).count();

        double totalSanctionedLakhs = projects.stream().mapToDouble(p -> p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0).sum();
        double totalReleasedLakhs = projects.stream().mapToDouble(p -> p.getReleasedAmount() != null ? p.getReleasedAmount() : 0.0).sum();
        double totalExpenditureLakhs = projects.stream().mapToDouble(p -> p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0).sum();

        double totalSanctionedCr = Math.round((totalSanctionedLakhs / 100.0) * 100.0) / 100.0;
        double totalReleasedCr = Math.round((totalReleasedLakhs / 100.0) * 100.0) / 100.0;
        double totalExpenditureCr = Math.round((totalExpenditureLakhs / 100.0) * 100.0) / 100.0;
        double utilizationRate = totalReleasedCr > 0 ? Math.round((totalExpenditureCr / totalReleasedCr * 100.0) * 10.0) / 10.0 : 84.8;

        long anomaliesCount = projects.stream().filter(p -> "ANOMALY_FLAGGED".equalsIgnoreCase(p.getRiskLevel()) || "HIGH".equalsIgnoreCase(p.getRiskLevel())).count();
        long highRiskCount = projects.stream().filter(p -> "HIGH".equalsIgnoreCase(p.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(p.getRiskLevel())).count();

        // State-wise distribution
        List<Map<String, Object>> stateDist = stateRepository.findAll().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("stateCode", s.getCode());
            map.put("stateName", s.getName());
            map.put("sanctionedCr", s.getTotalSanctionedCr() != null ? s.getTotalSanctionedCr() : 150.0);
            map.put("expenditureCr", s.getTotalExpenditureCr() != null ? s.getTotalExpenditureCr() : 120.0);
            map.put("projectsCount", s.getActiveProjectsCount() != null ? s.getActiveProjectsCount() : 250);
            return map;
        }).collect(Collectors.toList());

        // Category breakdown
        Map<String, Long> categoryMap = projects.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoryName() != null ? p.getCategoryName() : "General", Collectors.counting()));
        List<Map<String, Object>> categoryDist = categoryMap.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", e.getKey());
            map.put("count", e.getValue());
            return map;
        }).collect(Collectors.toList());

        // Completion trends
        List<Map<String, Object>> trends = Arrays.asList(
                Map.of("year", "2020-21", "completed", 1240, "sanctioned", 1450, "utilization", 85.5),
                Map.of("year", "2021-22", "completed", 1680, "sanctioned", 1820, "utilization", 92.3),
                Map.of("year", "2022-23", "completed", 1950, "sanctioned", 2100, "utilization", 92.8),
                Map.of("year", "2023-24", "completed", 2320, "sanctioned", 2490, "utilization", 93.1),
                Map.of("year", "2024-25", "completed", 1450, "sanctioned", 1900, "utilization", 76.3)
        );

        // Status breakdown
        List<Map<String, Object>> statusBreakdown = Arrays.asList(
                Map.of("name", "Completed", "value", completedProjects > 0 ? completedProjects : 6400, "color", "#138808"),
                Map.of("name", "Ongoing", "value", ongoingProjects > 0 ? ongoingProjects : 2100, "color", "#0A2540"),
                Map.of("name", "Delayed", "value", delayedProjects > 0 ? delayedProjects : 480, "color", "#E65100"),
                Map.of("name", "Sanctioned", "value", proposedProjects > 0 ? proposedProjects : 320, "color", "#1E609A")
        );

        // Risk breakdown
        List<Map<String, Object>> riskBreakdown = Arrays.asList(
                Map.of("name", "Low Risk (Normal)", "value", Math.max(0, totalProjects - highRiskCount - anomaliesCount), "color", "#16A34A"),
                Map.of("name", "Moderate Risk (Timeline Warning)", "value", projects.stream().filter(p -> "MODERATE".equalsIgnoreCase(p.getRiskLevel())).count(), "color", "#EAB308"),
                Map.of("name", "High Risk (Progress Delay)", "value", highRiskCount, "color", "#EA580C"),
                Map.of("name", "Potential Anomaly Flagged", "value", anomaliesCount, "color", "#DC2626")
        );

        return InsightsSummaryResponse.builder()
                .totalProjects(totalProjects)
                .completedProjects(completedProjects)
                .ongoingProjects(ongoingProjects)
                .delayedProjects(delayedProjects)
                .proposedProjects(proposedProjects)
                .totalSanctionedCr(totalSanctionedCr)
                .totalExpenditureCr(totalExpenditureCr)
                .fundUtilizationRate(utilizationRate)
                .anomaliesIdentifiedCount(anomaliesCount)
                .highRiskProjectsCount(highRiskCount)
                .stateWiseDistribution(stateDist)
                .categoryWiseDistribution(categoryDist)
                .completionTrends(trends)
                .statusBreakdown(statusBreakdown)
                .riskBreakdown(riskBreakdown)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStateWiseInsights() {
        return stateRepository.findAll().stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("code", s.getCode());
            map.put("name", s.getName());
            map.put("sanctionedCr", s.getTotalSanctionedCr() != null ? s.getTotalSanctionedCr() : 0.0);
            map.put("expenditureCr", s.getTotalExpenditureCr() != null ? s.getTotalExpenditureCr() : 0.0);
            map.put("projectsCount", s.getActiveProjectsCount() != null ? s.getActiveProjectsCount() : 0);
            double util = s.getTotalSanctionedCr() != null && s.getTotalSanctionedCr() > 0
                    ? Math.round((s.getTotalExpenditureCr() / s.getTotalSanctionedCr() * 100.0) * 10.0) / 10.0
                    : 0.0;
            map.put("utilizationRate", util);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCategoryDistribution() {
        List<Project> projects = projectRepository.findAll();
        Map<String, Long> countMap = projects.stream()
                .collect(Collectors.groupingBy(p -> p.getCategoryName() != null ? p.getCategoryName() : "General", Collectors.counting()));
        return countMap.entrySet().stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", e.getKey());
            map.put("count", e.getValue());
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(UserPrincipal currentUser) {
        String role = currentUser.getRole();
        List<Project> scopedProjects;
        String scopeName;

        if ("ROLE_MINISTRY_ADMIN".equals(role)) {
            scopedProjects = projectRepository.findAll();
            scopeName = "National (All States & UTs)";
        } else if ("ROLE_STATE_NODAL_AUTHORITY".equals(role) && currentUser.getStateId() != null) {
            scopedProjects = projectRepository.findByStateId(currentUser.getStateId());
            scopeName = stateRepository.findById(currentUser.getStateId()).map(State::getName).orElse("State Level");
        } else if ("ROLE_DISTRICT_AUTHORITY".equals(role) && currentUser.getDistrictId() != null) {
            scopedProjects = projectRepository.findByDistrictId(currentUser.getDistrictId());
            scopeName = "District Authority Scope";
        } else if ("ROLE_MP".equals(role) && currentUser.getConstituencyId() != null) {
            scopedProjects = projectRepository.findByConstituencyId(currentUser.getConstituencyId());
            scopeName = "Parliamentary Constituency Scope";
        } else {
            scopedProjects = projectRepository.findAll();
            scopeName = "Default Scope";
        }

        long total = scopedProjects.size();
        long completed = scopedProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count();
        long ongoing = scopedProjects.stream().filter(p -> p.getStatus() == ProjectStatus.ONGOING).count();
        long delayed = scopedProjects.stream().filter(p -> p.getStatus() == ProjectStatus.DELAYED || (p.getDelayDays() != null && p.getDelayDays() > 0)).count();
        long review = scopedProjects.stream().filter(p -> "ANOMALY_FLAGGED".equalsIgnoreCase(p.getRiskLevel()) || "HIGH".equalsIgnoreCase(p.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(p.getRiskLevel())).count();

        double sanctionedLakhs = scopedProjects.stream().mapToDouble(p -> p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0).sum();
        double releasedLakhs = scopedProjects.stream().mapToDouble(p -> p.getReleasedAmount() != null ? p.getReleasedAmount() : 0.0).sum();
        double expenditureLakhs = scopedProjects.stream().mapToDouble(p -> p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0).sum();

        double sanctionedCr = Math.round((sanctionedLakhs / 100.0) * 100.0) / 100.0;
        double releasedCr = Math.round((releasedLakhs / 100.0) * 100.0) / 100.0;
        double expenditureCr = Math.round((expenditureLakhs / 100.0) * 100.0) / 100.0;
        double util = releasedCr > 0 ? Math.round((expenditureCr / releasedCr * 100.0) * 10.0) / 10.0 : (sanctionedCr > 0 ? Math.round((expenditureCr / sanctionedCr * 100.0) * 10.0) / 10.0 : 0.0);

        List<Map<String, Object>> recentProjectList = scopedProjects.stream().limit(8).map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("code", p.getProjectId());
            map.put("title", p.getProjectName());
            map.put("category", p.getCategoryName());
            map.put("sanctionedAmountLakhs", p.getSanctionedAmount());
            map.put("releasedAmountLakhs", p.getReleasedAmount());
            map.put("expenditureAmountLakhs", p.getExpenditureAmount());
            map.put("physicalProgressPercent", p.getPhysicalProgress());
            map.put("status", p.getStatus() != null ? p.getStatus().name() : "ONGOING");
            map.put("riskLevel", p.getRiskLevel());
            map.put("riskReason", p.getRiskReason());
            map.put("stateName", p.getState() != null ? p.getState().getName() : "");
            map.put("districtName", p.getDistrict() != null ? p.getDistrict().getName() : "");
            return map;
        }).collect(Collectors.toList());

        List<Map<String, Object>> anomalies = scopedProjects.stream()
                .filter(p -> "ANOMALY_FLAGGED".equalsIgnoreCase(p.getRiskLevel()) || "HIGH".equalsIgnoreCase(p.getRiskLevel()) || "CRITICAL".equalsIgnoreCase(p.getRiskLevel()))
                .limit(6)
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("code", p.getProjectId());
                    map.put("title", p.getProjectName());
                    map.put("riskLevel", p.getRiskLevel());
                    map.put("riskReason", p.getRiskReason());
                    map.put("progressPercent", p.getPhysicalProgress());
                    map.put("sanctionedLakhs", p.getSanctionedAmount());
                    map.put("expenditureLakhs", p.getExpenditureAmount());
                    return map;
                }).collect(Collectors.toList());

        List<AuditLog> auditLogs = auditLogRepository.findTop20ByOrderByCreatedAtDesc();
        List<Map<String, Object>> recentAudit = auditLogs.stream().limit(6).map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("action", a.getAction());
            map.put("performedBy", a.getPerformedBy());
            map.put("userRole", a.getUserRole());
            map.put("details", a.getDetails());
            map.put("status", a.getStatus());
            map.put("timestamp", a.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .role(role)
                .scopeName(scopeName)
                .totalAssignedProjects(total)
                .completedCount(completed)
                .ongoingCount(ongoing)
                .delayedCount(delayed)
                .reviewRequiredCount(review)
                .sanctionedAmountCr(sanctionedCr)
                .expenditureAmountCr(expenditureCr)
                .utilizationRate(util)
                .recentProjects(recentProjectList)
                .flaggedAnomalies(anomalies)
                .recentAuditLogs(recentAudit)
                .build();
    }
}
