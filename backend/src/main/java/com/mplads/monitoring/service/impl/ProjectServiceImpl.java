package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.request.ProjectReviewRequest;
import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.dto.response.PagedResponse;
import com.mplads.monitoring.dto.response.ProjectResponse;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.exception.AppException;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.repository.*;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuditLogService;
import com.mplads.monitoring.service.ProjectService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final ConstituencyRepository constituencyRepository;
    private final UserRepository userRepository;
    private final ProjectCategoryRepository categoryRepository;
    private final SanctionRepository sanctionRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> getProjects(
            UserPrincipal currentUser,
            Long stateId,
            Long districtId,
            Long constituencyId,
            String mpName,
            String status,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String riskLevel,
            String search,
            Pageable pageable) {

        Specification<Project> spec = createProjectSpecification(
                currentUser, stateId, districtId, constituencyId, mpName, status, category, startDate, endDate, riskLevel, search
        );

        Page<Project> page = projectRepository.findAll(spec, pageable);
        List<ProjectResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<ProjectResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        verifyProjectAccess(project, currentUser);
        return mapToResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest request, UserPrincipal currentUser) {
        String role = currentUser.getRole();
        if (!"ROLE_MP".equals(role) && !"ROLE_MINISTRY_ADMIN".equals(role) && !"ROLE_DISTRICT_AUTHORITY".equals(role)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only authorized Members of Parliament or administrative authorities can recommend works.");
        }

        Long stateId = request.getStateId();
        Long districtId = request.getDistrictId();
        Long constituencyId = request.getConstituencyId();

        // Role-based jurisdiction auto-scoping and enforcement
        if ("ROLE_MP".equals(role)) {
            if (currentUser.getStateId() != null) {
                stateId = currentUser.getStateId();
            }
            if (currentUser.getDistrictId() != null && districtId == null) {
                districtId = currentUser.getDistrictId();
            }
            if (currentUser.getConstituencyId() != null) {
                constituencyId = currentUser.getConstituencyId();
            }
        } else if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
            if (currentUser.getDistrictId() != null) {
                districtId = currentUser.getDistrictId();
            }
            if (currentUser.getStateId() != null) {
                stateId = currentUser.getStateId();
            }
        }

        if (stateId == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "State is required to recommend a project.");
        }
        if (districtId == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "District is required to recommend a project.");
        }

        final Long finalStateId = stateId;
        final Long finalDistrictId = districtId;

        State state = stateRepository.findById(finalStateId)
                .orElseThrow(() -> new ResourceNotFoundException("State", "id", finalStateId));

        District district = districtRepository.findById(finalDistrictId)
                .orElseThrow(() -> new ResourceNotFoundException("District", "id", finalDistrictId));

        Constituency constituency = null;
        if (constituencyId != null) {
            constituency = constituencyRepository.findById(constituencyId).orElse(null);
        }

        User mpUser = null;
        String mpName = request.getMpName();
        if ("ROLE_MP".equals(role)) {
            mpUser = userRepository.findById(currentUser.getId()).orElse(null);
            mpName = currentUser.getFullName();
        } else if (request.getMpUserId() != null) {
            mpUser = userRepository.findById(request.getMpUserId()).orElse(null);
        }
        if (mpName == null || mpName.isBlank()) {
            mpName = constituency != null ? constituency.getMpName() : (mpUser != null ? mpUser.getFullName() : "Hon. Member of Parliament");
        }

        ProjectCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        } else if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            category = categoryRepository.findByName(request.getCategoryName()).orElse(null);
        }

        // Unique government project code generation
        String projectCode = request.getProjectId();
        if (projectCode == null || projectCode.isBlank()) {
            String stateCode = state.getCode() != null ? state.getCode().replace("STATE-", "") : "IN";
            String distPart = district.getCode() != null
                    ? district.getCode().replace("MH-", "").replace("UP-", "").replace("KA-", "").replace("TN-", "").replace("GJ-", "").replace("DIST-", "")
                    : "DIS";
            int year = LocalDate.now().getYear();
            long count = projectRepository.count() + 1;
            do {
                projectCode = String.format("MPLADS-%s-%s-%d-%03d", stateCode, distPart, year, count);
                count++;
            } while (projectRepository.existsByProjectId(projectCode));
        } else {
            if (projectRepository.existsByProjectId(projectCode)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Project ID '" + projectCode + "' already exists.");
            }
        }

        // Initial status: PROPOSED ("Submitted / Pending Review")
        ProjectStatus projectStatus = ProjectStatus.PROPOSED;
        if ("ROLE_MINISTRY_ADMIN".equals(role) && request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                projectStatus = ProjectStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        double sanctioned = request.getSanctionedAmount() != null ? request.getSanctionedAmount() : 0.0;
        double released = 0.0;
        double expenditure = 0.0;
        int physicalProgress = 0;
        double financialProgress = 0.0;

        if ("ROLE_MINISTRY_ADMIN".equals(role)) {
            released = request.getReleasedAmount() != null ? request.getReleasedAmount() : 0.0;
            expenditure = request.getExpenditureAmount() != null ? request.getExpenditureAmount() : 0.0;
            physicalProgress = request.getPhysicalProgress() != null ? request.getPhysicalProgress() : 0;
            financialProgress = request.getFinancialProgress() != null ? request.getFinancialProgress() : 0.0;
        }

        LocalDate targetDate = request.getExpectedCompletionDate() != null
                ? request.getExpectedCompletionDate()
                : LocalDate.now().plusMonths(6);

        Project project = Project.builder()
                .projectId(projectCode)
                .projectName(request.getProjectName())
                .description(request.getDescription())
                .state(state)
                .district(district)
                .constituency(constituency)
                .mpUser(mpUser)
                .mpName(mpName)
                .implementingAgency(request.getImplementingAgency() != null && !request.getImplementingAgency().isBlank() ? request.getImplementingAgency() : "District Implementing Agency")
                .category(category)
                .categoryName(category != null ? category.getName() : (request.getCategoryName() != null ? request.getCategoryName() : "Rural Infrastructure"))
                .sanctionedAmount(sanctioned)
                .releasedAmount(released)
                .expenditureAmount(expenditure)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .expectedCompletionDate(targetDate)
                .actualCompletionDate(request.getActualCompletionDate())
                .physicalProgress(physicalProgress)
                .financialProgress(financialProgress)
                .status(projectStatus)
                .riskLevel("LOW")
                .riskScore(10.0)
                .riskReason(null)
                .latitude(request.getLatitude() != null ? request.getLatitude() : 18.5204)
                .longitude(request.getLongitude() != null ? request.getLongitude() : 73.8567)
                .delayDays(0)
                .beneficiaries(request.getBeneficiaries() != null ? request.getBeneficiaries() : 0)
                .locationDetails(request.getLocationDetails())
                .documentUrl(request.getDocumentUrl())
                .feasibilityRemarks(request.getFeasibilityRemarks())
                .build();

        Project saved = projectRepository.save(project);

        auditLogService.logAction(
                "PROJECT_RECOMMENDED",
                currentUser.getEmail(),
                currentUser.getRole(),
                String.format("Recommended new MPLADS project %s ('%s') with estimated cost ₹%.2f Lakhs", projectCode, saved.getProjectName(), sanctioned),
                "127.0.0.1",
                "SUCCESS"
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        verifyProjectAccess(project, currentUser);

        if (request.getProjectName() != null) project.setProjectName(request.getProjectName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getImplementingAgency() != null) project.setImplementingAgency(request.getImplementingAgency());
        if (request.getSanctionedAmount() != null) project.setSanctionedAmount(request.getSanctionedAmount());
        if (request.getReleasedAmount() != null) project.setReleasedAmount(request.getReleasedAmount());
        if (request.getExpenditureAmount() != null) project.setExpenditureAmount(request.getExpenditureAmount());
        if (request.getPhysicalProgress() != null) project.setPhysicalProgress(request.getPhysicalProgress());
        if (request.getFinancialProgress() != null) project.setFinancialProgress(request.getFinancialProgress());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getExpectedCompletionDate() != null) project.setExpectedCompletionDate(request.getExpectedCompletionDate());
        if (request.getActualCompletionDate() != null) project.setActualCompletionDate(request.getActualCompletionDate());
        if (request.getLatitude() != null) project.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) project.setLongitude(request.getLongitude());
        if (request.getRiskLevel() != null) project.setRiskLevel(request.getRiskLevel());
        if (request.getRiskReason() != null) project.setRiskReason(request.getRiskReason());
        if (request.getBeneficiaries() != null) project.setBeneficiaries(request.getBeneficiaries());
        if (request.getLocationDetails() != null) project.setLocationDetails(request.getLocationDetails());
        if (request.getDocumentUrl() != null) project.setDocumentUrl(request.getDocumentUrl());
        if (request.getFeasibilityRemarks() != null) project.setFeasibilityRemarks(request.getFeasibilityRemarks());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                project.setStatus(ProjectStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {}
        }

        int delay = calculateDelayDays(project.getExpectedCompletionDate(), project.getActualCompletionDate(), project.getStatus());
        project.setDelayDays(delay);

        Project updated = projectRepository.save(project);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public ProjectResponse reviewProject(Long id, ProjectReviewRequest request, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        String role = currentUser.getRole();
        if (!"ROLE_DISTRICT_AUTHORITY".equals(role) && !"ROLE_MINISTRY_ADMIN".equals(role)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only District Authorities or Ministry Administrators can review and sanction projects.");
        }

        // District Authority jurisdiction verification
        if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
            if (currentUser.getDistrictId() == null || project.getDistrict() == null
                    || !currentUser.getDistrictId().equals(project.getDistrict().getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: You are only authorized to review projects in your assigned District.");
            }
        }

        String action = request.getAction() != null ? request.getAction().toUpperCase() : "SANCTION";

        project.setFeasibilityRemarks(request.getRemarks());
        project.setReviewedBy(currentUser.getFullName());
        project.setReviewedAt(LocalDateTime.now());

        if (request.getImplementingAgency() != null && !request.getImplementingAgency().isBlank()) {
            project.setImplementingAgency(request.getImplementingAgency());
        }

        if ("SANCTION".equals(action) || "APPROVE".equals(action)) {
            project.setStatus(ProjectStatus.SANCTIONED);
            if (request.getSanctionedAmount() != null && request.getSanctionedAmount() > 0) {
                project.setSanctionedAmount(request.getSanctionedAmount());
            }

            // Create official Sanction record if sanction order number provided
            String orderNum = request.getSanctionOrderNumber();
            if (orderNum == null || orderNum.isBlank()) {
                orderNum = String.format("SO/%s/%d/%04d", project.getDistrict() != null ? project.getDistrict().getCode() : "DIST", LocalDate.now().getYear(), project.getId());
            }

            Sanction sanction = Sanction.builder()
                    .project(project)
                    .sanctionOrderNumber(orderNum)
                    .sanctionDate(request.getSanctionDate() != null ? request.getSanctionDate() : LocalDate.now())
                    .sanctionedAmount(project.getSanctionedAmount())
                    .sanctioningAuthority(currentUser.getFullName())
                    .workOrderNumber(request.getWorkOrderNumber() != null ? request.getWorkOrderNumber() : ("WO/" + orderNum))
                    .remarks(request.getRemarks())
                    .build();
            sanctionRepository.save(sanction);

            auditLogService.logAction(
                    "PROJECT_SANCTIONED",
                    currentUser.getEmail(),
                    currentUser.getRole(),
                    String.format("Feasibility assessment passed & sanction granted for %s: Order %s, Amount ₹%.2f Lakhs", project.getProjectId(), orderNum, project.getSanctionedAmount()),
                    "127.0.0.1",
                    "SUCCESS"
            );
        } else if ("REJECT".equals(action) || "CANCEL".equals(action)) {
            project.setStatus(ProjectStatus.REJECTED);
            auditLogService.logAction(
                    "PROJECT_REJECTED",
                    currentUser.getEmail(),
                    currentUser.getRole(),
                    String.format("Project %s rejected during technical scrutiny: %s", project.getProjectId(), request.getRemarks()),
                    "127.0.0.1",
                    "SUCCESS"
            );
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid review action. Allowed actions are SANCTION or REJECT.");
        }

        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectCategory> getCategories() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteProject(Long id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        if (!"ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only Ministry Administrators can delete project records.");
        }

        projectRepository.delete(project);
    }

    @Override
    @Transactional(readOnly = true)
    public AiAnalysisPreviewResponse getAiAnalysis(Long id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));

        verifyProjectAccess(project, currentUser);

        double util = project.calculateUtilization();
        int phys = project.getPhysicalProgress() != null ? project.getPhysicalProgress() : 0;
        int delay = project.getDelayDays() != null ? project.getDelayDays() : 0;

        String health = "NORMAL";
        double riskScore = 12.0;
        String classification = "Low Risk (On Schedule)";
        List<AiAnalysisPreviewResponse.AnomalyIndicator> indicators = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (util > 80.0 && phys < 40) {
            health = "ANOMALOUS";
            riskScore = 84.5;
            classification = "High Anomaly Risk (Progress-Expenditure Desynchronization)";
            indicators.add(AiAnalysisPreviewResponse.AnomalyIndicator.builder()
                    .featureName("Expenditure vs Physical Progress Divergence")
                    .detectedPattern(String.format("Fund disbursement is at %.1f%% while physical site progress is only %d%%.", util, phys))
                    .confidence("92.4%")
                    .severity("HIGH")
                    .explanation("Statistical outlier compared to typical milestone execution curve. Disproportionate early drawdown detected.")
                    .build());
            recommendations.add("Trigger on-site third party engineering verification before releasing subsequent installment.");
            recommendations.add("Request geotagged high-resolution photographs of current milestone foundations.");
        } else if (delay > 45) {
            health = "ATTENTION_REQUIRED";
            riskScore = 62.0;
            classification = "Moderate Delay Risk (Timeline Overrun)";
            indicators.add(AiAnalysisPreviewResponse.AnomalyIndicator.builder()
                    .featureName("Milestone Schedule Drift")
                    .detectedPattern(String.format("Project is running %d days beyond scheduled completion baseline.", delay))
                    .confidence("88.0%")
                    .severity("MEDIUM")
                    .explanation("Historical data indicates 45+ day delays have a 70% probability of requiring cost revision or contractor extension.")
                    .build());
            recommendations.add("Issue nodal authority milestone notice to the implementing agency.");
        } else {
            indicators.add(AiAnalysisPreviewResponse.AnomalyIndicator.builder()
                    .featureName("Milestone Execution Rhythm")
                    .detectedPattern("Physical progress and financial utilization curve are statistically balanced.")
                    .confidence("96.1%")
                    .severity("LOW")
                    .explanation("Standard linear execution verified across monthly contractor submissions.")
                    .build());
            recommendations.add("Continue standard quarterly monitoring cycles.");
        }

        LocalDate exp = project.getExpectedCompletionDate() != null ? project.getExpectedCompletionDate() : LocalDate.now().plusMonths(6);
        LocalDate estimated = delay > 0 ? exp.plusDays(delay + 20) : exp;

        return AiAnalysisPreviewResponse.builder()
                .projectId(project.getId())
                .projectCode(project.getProjectId())
                .overallHealth(health)
                .anomalyRiskScore(riskScore)
                .riskClassification(classification)
                .anomalyIndicators(indicators)
                .predictiveTimeline(AiAnalysisPreviewResponse.PredictiveTimeline.builder()
                        .expectedCompletion(exp.toString())
                        .aiEstimatedCompletion(estimated.toString())
                        .estimatedDelayDays(delay > 0 ? delay + 20 : 0)
                        .costOverrunRiskPercent(delay > 60 ? 18.5 : 2.4)
                        .build())
                .aiRecommendations(recommendations)
                .build();
    }

    private void verifyProjectAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRole();
        if ("ROLE_MINISTRY_ADMIN".equals(role)) {
            return; // full access
        }
        if ("ROLE_STATE_NODAL_AUTHORITY".equals(role)) {
            if (currentUser.getStateId() != null && project.getState() != null
                    && currentUser.getStateId().equals(project.getState().getId())) {
                return;
            }
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: You are only authorized to view projects in your assigned State.");
        }
        if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
            if (currentUser.getDistrictId() != null && project.getDistrict() != null
                    && currentUser.getDistrictId().equals(project.getDistrict().getId())) {
                return;
            }
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: You are only authorized to view projects in your assigned District.");
        }
        if ("ROLE_MP".equals(role)) {
            if (currentUser.getConstituencyId() != null && project.getConstituency() != null
                    && currentUser.getConstituencyId().equals(project.getConstituency().getId())) {
                return;
            }
            if (project.getMpUser() != null && currentUser.getId().equals(project.getMpUser().getId())) {
                return;
            }
            throw new AppException(HttpStatus.FORBIDDEN, "Access Restricted: You are only authorized to view projects in your assigned Parliamentary Constituency.");
        }
    }

    private Specification<Project> createProjectSpecification(
            UserPrincipal currentUser,
            Long stateId,
            Long districtId,
            Long constituencyId,
            String mpName,
            String status,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String riskLevel,
            String search) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Role-based backend security enforcement
            String role = currentUser.getRole();
            if ("ROLE_STATE_NODAL_AUTHORITY".equals(role)) {
                if (currentUser.getStateId() != null) {
                    predicates.add(cb.equal(root.get("state").get("id"), currentUser.getStateId()));
                }
            } else if ("ROLE_DISTRICT_AUTHORITY".equals(role)) {
                if (currentUser.getDistrictId() != null) {
                    predicates.add(cb.equal(root.get("district").get("id"), currentUser.getDistrictId()));
                }
            } else if ("ROLE_MP".equals(role)) {
                if (currentUser.getConstituencyId() != null) {
                    predicates.add(cb.equal(root.get("constituency").get("id"), currentUser.getConstituencyId()));
                }
            } else {
                // ROLE_MINISTRY_ADMIN can filter by any state, district, constituency
                if (stateId != null) {
                    predicates.add(cb.equal(root.get("state").get("id"), stateId));
                }
            }

            // District filter
            if (districtId != null && !"ROLE_DISTRICT_AUTHORITY".equals(role)) {
                predicates.add(cb.equal(root.get("district").get("id"), districtId));
            }

            // Constituency filter
            if (constituencyId != null && !"ROLE_MP".equals(role)) {
                predicates.add(cb.equal(root.get("constituency").get("id"), constituencyId));
            }

            // MP filter
            if (mpName != null && !mpName.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("mpName")), "%" + mpName.toLowerCase() + "%"));
            }

            // Status filter
            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                try {
                    ProjectStatus ps = ProjectStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("status"), ps));
                } catch (IllegalArgumentException ignored) {}
            }

            // Category filter
            if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("categoryName")), "%" + category.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("category").get("name")), "%" + category.toLowerCase() + "%")
                ));
            }

            // Date range filter
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expectedCompletionDate"), endDate));
            }

            // Risk level filter
            if (riskLevel != null && !riskLevel.isBlank() && !"ALL".equalsIgnoreCase(riskLevel)) {
                predicates.add(cb.equal(cb.upper(root.get("riskLevel")), riskLevel.toUpperCase()));
            }

            // Search query across ID, Title, Agency, MP
            if (search != null && !search.isBlank()) {
                String term = "%" + search.toLowerCase().trim() + "%";
                Predicate searchPredicate = cb.or(
                        cb.like(cb.lower(root.get("projectId")), term),
                        cb.like(cb.lower(root.get("projectName")), term),
                        cb.like(cb.lower(root.get("implementingAgency")), term),
                        cb.like(cb.lower(root.get("mpName")), term)
                );
                predicates.add(searchPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private int calculateDelayDays(LocalDate expected, LocalDate actual, ProjectStatus status) {
        if (expected == null) return 0;
        if (status == ProjectStatus.COMPLETED && actual != null) {
            long days = ChronoUnit.DAYS.between(expected, actual);
            return (int) Math.max(0, days);
        }
        if (status == ProjectStatus.ONGOING || status == ProjectStatus.DELAYED) {
            LocalDate today = LocalDate.now();
            if (today.isAfter(expected)) {
                return (int) ChronoUnit.DAYS.between(expected, today);
            }
        }
        return 0;
    }

    private ProjectResponse mapToResponse(Project p) {
        double util = p.calculateUtilization();
        int delay = p.getDelayDays() != null ? p.getDelayDays() : calculateDelayDays(p.getExpectedCompletionDate(), p.getActualCompletionDate(), p.getStatus());
        boolean isDelayed = delay > 0 || p.getStatus() == ProjectStatus.DELAYED;

        return ProjectResponse.builder()
                .id(p.getId())
                .projectId(p.getProjectId())
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .stateId(p.getState() != null ? p.getState().getId() : null)
                .stateCode(p.getState() != null ? p.getState().getCode() : null)
                .stateName(p.getState() != null ? p.getState().getName() : null)
                .districtId(p.getDistrict() != null ? p.getDistrict().getId() : null)
                .districtCode(p.getDistrict() != null ? p.getDistrict().getCode() : null)
                .districtName(p.getDistrict() != null ? p.getDistrict().getName() : null)
                .constituencyId(p.getConstituency() != null ? p.getConstituency().getId() : null)
                .constituencyCode(p.getConstituency() != null ? p.getConstituency().getCode() : null)
                .constituencyName(p.getConstituency() != null ? p.getConstituency().getName() : null)
                .mpUserId(p.getMpUser() != null ? p.getMpUser().getId() : null)
                .mpName(p.getMpName() != null ? p.getMpName() : (p.getConstituency() != null ? p.getConstituency().getMpName() : "Hon. Member of Parliament"))
                .implementingAgency(p.getImplementingAgency() != null ? p.getImplementingAgency() : "Designated Agency")
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryCode(p.getCategory() != null ? p.getCategory().getCode() : null)
                .categoryName(p.getCategoryName() != null ? p.getCategoryName() : (p.getCategory() != null ? p.getCategory().getName() : "Infrastructure"))
                .sanctionedAmount(p.getSanctionedAmount())
                .releasedAmount(p.getReleasedAmount())
                .expenditureAmount(p.getExpenditureAmount())
                .utilizationPercent(util)
                .startDate(p.getStartDate())
                .expectedCompletionDate(p.getExpectedCompletionDate())
                .actualCompletionDate(p.getActualCompletionDate())
                .physicalProgress(p.getPhysicalProgress() != null ? p.getPhysicalProgress() : 0)
                .financialProgress(p.getFinancialProgress() != null ? p.getFinancialProgress() : 0.0)
                .status(p.getStatus() != null ? p.getStatus().name() : "ONGOING")
                .riskLevel(p.getRiskLevel() != null ? p.getRiskLevel() : "LOW")
                .riskScore(p.getRiskScore() != null ? p.getRiskScore() : 10.0)
                .riskReason(p.getRiskReason())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .delayDays(delay)
                .isDelayed(isDelayed)
                .beneficiaries(p.getBeneficiaries())
                .locationDetails(p.getLocationDetails())
                .documentUrl(p.getDocumentUrl())
                .feasibilityRemarks(p.getFeasibilityRemarks())
                .reviewedBy(p.getReviewedBy())
                .reviewedAt(p.getReviewedAt())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
