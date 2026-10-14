package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.AgencyReliabilityResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.ProjectStatus;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.service.AgencyAnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AgencyAnalyticsServiceImpl implements AgencyAnalyticsService {

    private final ProjectRepository projectRepository;

    public AgencyAnalyticsServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }


    @Override
    @Transactional(readOnly = true)
    public List<AgencyReliabilityResponse> getAgencyReliabilityLeaderboard() {
        List<Project> allProjects = projectRepository.findAll();

        Map<String, List<Project>> agencyMap = allProjects.stream()
                .filter(p -> p.getImplementingAgency() != null && !p.getImplementingAgency().isBlank())
                .collect(Collectors.groupingBy(Project::getImplementingAgency));

        List<AgencyReliabilityResponse> responses = new ArrayList<>();
        for (Map.Entry<String, List<Project>> entry : agencyMap.entrySet()) {
            responses.add(calculateAgencyProfile(entry.getKey(), entry.getValue()));
        }

        // Sort descending by composite reliability score
        responses.sort((a, b) -> Double.compare(b.getCompositeReliabilityScore(), a.getCompositeReliabilityScore()));
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public AgencyReliabilityResponse getAgencyDetails(String agencyName) {
        List<Project> agencyProjects = projectRepository.findByImplementingAgencyIgnoreCase(agencyName);

        if (agencyProjects.isEmpty()) {
            throw new ResourceNotFoundException("No records found for implementing agency: " + agencyName);
        }

        return calculateAgencyProfile(agencyName, agencyProjects);
    }

    private AgencyReliabilityResponse calculateAgencyProfile(String agencyName, List<Project> projects) {
        int total = projects.size();
        int completed = 0;
        int completedOnTime = 0;
        int active = 0;
        int delayed = 0;
        int highRisk = 0;
        double totalSanctionedLakhs = 0.0;
        double totalExpenditureLakhs = 0.0;
        double totalDelayDays = 0.0;

        for (Project p : projects) {
            double sanct = p.getSanctionedAmount() != null ? p.getSanctionedAmount() : 0.0;
            double exp = p.getExpenditureAmount() != null ? p.getExpenditureAmount() : 0.0;
            totalSanctionedLakhs += sanct;
            totalExpenditureLakhs += exp;

            int delay = p.getDelayDays() != null ? p.getDelayDays() : 0;
            totalDelayDays += delay;

            if (p.getStatus() == ProjectStatus.COMPLETED) {
                completed++;
                if (delay <= 0) {
                    completedOnTime++;
                }
            } else if (p.getStatus() == ProjectStatus.DELAYED || delay > 0) {
                delayed++;
                active++;
            } else {
                active++;
            }

            if ("HIGH".equals(p.getRiskLevel()) || "CRITICAL".equals(p.getRiskLevel())) {
                highRisk++;
            }
        }

        double onTimeRate = completed > 0 ? (completedOnTime * 100.0 / completed) : 75.0;
        double avgDelay = total > 0 ? (totalDelayDays / total) : 0.0;
        double budgetVariance = totalSanctionedLakhs > 0 ? 
                Math.abs(totalExpenditureLakhs - totalSanctionedLakhs) / totalSanctionedLakhs * 100.0 : 0.0;

        // Indicator contributions to 100-point composite reliability index
        double onTimePts = Math.min(35.0, (onTimeRate / 100.0) * 35.0);
        double delayPts = Math.max(0.0, 25.0 - (Math.min(avgDelay, 180.0) / 180.0 * 25.0));
        double budgetPts = Math.max(0.0, 25.0 - (Math.min(budgetVariance, 40.0) / 40.0 * 25.0));
        double riskCleanlinessPts = Math.max(0.0, 15.0 - ((double) highRisk / Math.max(total, 1) * 15.0));

        double compositeScore = Math.round((onTimePts + delayPts + budgetPts + riskCleanlinessPts) * 10.0) / 10.0;

        String band;
        String bandDesc;
        if (compositeScore >= 85.0) {
            band = "A+";
            bandDesc = "Exceptional Delivery & Governance Compliance";
        } else if (compositeScore >= 70.0) {
            band = "A";
            bandDesc = "Reliable Delivery with Minor Schedule Slippage";
        } else if (compositeScore >= 50.0) {
            band = "B";
            bandDesc = "Moderate Variance — Supervisory Oversight Recommended";
        } else {
            band = "C";
            bandDesc = "Elevated Overruns & Inefficiencies — Formal Inquiry Advised";
        }

        String completeness = total >= 10 ? "ROBUST" : (total >= 4 ? "MODERATE" : "PRELIMINARY");

        Map<String, Double> contributions = new LinkedHashMap<>();
        contributions.put("OnTimeCompletionPts", Math.round(onTimePts * 10.0) / 10.0);
        contributions.put("ScheduleDisciplinePts", Math.round(delayPts * 10.0) / 10.0);
        contributions.put("BudgetDisciplinePts", Math.round(budgetPts * 10.0) / 10.0);
        contributions.put("RiskMitigationPts", Math.round(riskCleanlinessPts * 10.0) / 10.0);

        return AgencyReliabilityResponse.builder()
                .agencyName(agencyName)
                .totalProjects(total)
                .completedProjects(completed)
                .activeProjects(active)
                .delayedProjects(delayed)
                .totalSanctionedCr(Math.round(totalSanctionedLakhs / 100.0 * 100.0) / 100.0)
                .totalExpenditureCr(Math.round(totalExpenditureLakhs / 100.0 * 100.0) / 100.0)
                .onTimeCompletionRatePct(Math.round(onTimeRate * 10.0) / 10.0)
                .averageDelayDays(Math.round(avgDelay * 10.0) / 10.0)
                .budgetVariancePct(Math.round(budgetVariance * 10.0) / 10.0)
                .compositeReliabilityScore(compositeScore)
                .performanceBand(band)
                .bandDescription(bandDesc)
                .indicatorContributions(contributions)
                .dataCompletenessStatus(completeness)
                .statutoryNotice("Reliability scores represent empirical statistical benchmarks. Not proof of contractual default or administrative debarment.")
                .build();
    }
}
