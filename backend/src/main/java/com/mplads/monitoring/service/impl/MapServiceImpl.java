package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.ProjectResponse;
import com.mplads.monitoring.entity.Project;
import com.mplads.monitoring.entity.ProjectStatus;
import com.mplads.monitoring.repository.ProjectRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MapServiceImpl implements MapService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getMapProjects(
            UserPrincipal currentUser,
            Long stateId,
            Long districtId,
            String status,
            String riskLevel,
            String category) {

        List<Project> projects;
        String role = currentUser != null ? currentUser.getRole() : null;

        if ("ROLE_STATE_NODAL_AUTHORITY".equals(role) && currentUser != null && currentUser.getStateId() != null) {
            projects = projectRepository.findByStateId(currentUser.getStateId());
        } else if ("ROLE_DISTRICT_AUTHORITY".equals(role) && currentUser != null && currentUser.getDistrictId() != null) {
            projects = projectRepository.findByDistrictId(currentUser.getDistrictId());
        } else if ("ROLE_MP".equals(role) && currentUser != null && currentUser.getConstituencyId() != null) {
            projects = projectRepository.findByConstituencyId(currentUser.getConstituencyId());
        } else {
            if (stateId != null) {
                projects = projectRepository.findByStateId(stateId);
            } else if (districtId != null) {
                projects = projectRepository.findByDistrictId(districtId);
            } else {
                projects = projectRepository.findAll();
            }
        }

        return projects.stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null)
                .filter(p -> {
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                        return p.getStatus() != null && p.getStatus().name().equalsIgnoreCase(status);
                    }
                    return true;
                })
                .filter(p -> {
                    if (riskLevel != null && !riskLevel.isBlank() && !"ALL".equalsIgnoreCase(riskLevel)) {
                        return p.getRiskLevel() != null && p.getRiskLevel().equalsIgnoreCase(riskLevel);
                    }
                    return true;
                })
                .filter(p -> {
                    if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                        return p.getCategoryName() != null && p.getCategoryName().toLowerCase().contains(category.toLowerCase());
                    }
                    return true;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .stateId(p.getState() != null ? p.getState().getId() : null)
                .stateName(p.getState() != null ? p.getState().getName() : "")
                .districtId(p.getDistrict() != null ? p.getDistrict().getId() : null)
                .districtName(p.getDistrict() != null ? p.getDistrict().getName() : "")
                .constituencyName(p.getConstituency() != null ? p.getConstituency().getName() : "")
                .mpName(p.getMpName())
                .implementingAgency(p.getImplementingAgency())
                .categoryName(p.getCategoryName())
                .sanctionedAmount(p.getSanctionedAmount())
                .releasedAmount(p.getReleasedAmount())
                .expenditureAmount(p.getExpenditureAmount())
                .utilizationPercent(p.calculateUtilization())
                .physicalProgress(p.getPhysicalProgress())
                .financialProgress(p.getFinancialProgress())
                .status(p.getStatus() != null ? p.getStatus().name() : "ONGOING")
                .riskLevel(p.getRiskLevel())
                .riskScore(p.getRiskScore())
                .riskReason(p.getRiskReason())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .delayDays(p.getDelayDays())
                .isDelayed(p.getDelayDays() != null && p.getDelayDays() > 0)
                .build();
    }
}
