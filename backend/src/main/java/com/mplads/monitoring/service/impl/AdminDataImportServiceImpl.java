package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.response.DataImportResultResponse;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.exception.AppException;
import com.mplads.monitoring.repository.*;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AdminDataImportService;
import com.mplads.monitoring.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AdminDataImportServiceImpl implements AdminDataImportService {

    private final ProjectRepository projectRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final DataImportRecordRepository importRecordRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminDataImportServiceImpl(
            ProjectRepository projectRepository,
            StateRepository stateRepository,
            DistrictRepository districtRepository,
            DataImportRecordRepository importRecordRepository,
            AuditLogRepository auditLogRepository) {
        this.projectRepository = projectRepository;
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.importRecordRepository = importRecordRepository;
        this.auditLogRepository = auditLogRepository;
    }


    @Override
    @Transactional(readOnly = true)
    public DataImportResultResponse validateCsvData(String fileName, String csvContent, UserPrincipal currentUser) {
        if (!"ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only Ministry Administrators can access Data Import services.");
        }

        if (csvContent == null || csvContent.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Import file content cannot be empty.");
        }

        String batchId = "IMP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String[] lines = csvContent.split("\\r?\\n");

        if (lines.length <= 1) {
            return DataImportResultResponse.builder()
                    .batchId(batchId)
                    .fileName(fileName)
                    .totalRecords(0)
                    .validRecords(0)
                    .invalidRecords(0)
                    .duplicateRecords(0)
                    .canProceed(false)
                    .validationErrors(List.of("File contains only headers or is empty."))
                    .previewRows(Collections.emptyList())
                    .build();
        }

        List<String> headers = Arrays.stream(lines[0].split(",")).map(String::trim).toList();
        List<String> errors = new ArrayList<>();
        List<Map<String, Object>> previewRows = new ArrayList<>();
        Set<String> seenProjectCodes = new HashSet<>();

        int validCount = 0;
        int invalidCount = 0;
        int duplicateCount = 0;

        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) continue;

            String[] cols = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);
            if (cols.length < 5) {
                invalidCount++;
                errors.add(String.format("Row %d: Missing required columns (expected at least 5 columns).", i));
                continue;
            }

            String projectCode = cols[0].trim().replace("\"", "");
            String projectName = cols[1].trim().replace("\"", "");
            String stateCode = cols[2].trim().replace("\"", "");
            String districtCode = cols[3].trim().replace("\"", "");
            String category = cols.length > 4 ? cols[4].trim().replace("\"", "") : "Infrastructure";
            String sanctionedStr = cols.length > 5 ? cols[5].trim().replace("\"", "") : "0.0";
            String agency = cols.length > 6 ? cols[6].trim().replace("\"", "") : "Public Works Dept";

            boolean rowValid = true;
            String rowError = "";

            if (projectCode.isBlank() || projectName.isBlank()) {
                rowValid = false;
                rowError = "Project Code and Name are mandatory.";
            } else if (seenProjectCodes.contains(projectCode) || projectRepository.existsByProjectId(projectCode)) {
                duplicateCount++;
                rowValid = false;
                rowError = "Duplicate Project Code detected: " + projectCode;
            } else {
                seenProjectCodes.add(projectCode);
            }

            double sanctioned = 0.0;
            try {
                sanctioned = Double.parseDouble(sanctionedStr);
            } catch (NumberFormatException e) {
                rowValid = false;
                rowError = "Invalid sanctioned amount format.";
            }

            Optional<State> stateOpt = stateRepository.findByCode(stateCode);
            Long stateId = null;
            Long districtId = null;
            if (stateOpt.isEmpty()) {
                rowValid = false;
                rowError = "Unknown State code: " + stateCode;
            } else {
                stateId = stateOpt.get().getId();
                Optional<District> distOpt = districtRepository.findByCode(districtCode);
                if (distOpt.isEmpty()) {
                    List<District> stateDistricts = districtRepository.findByStateId(stateId);
                    if (!stateDistricts.isEmpty()) {
                        districtId = stateDistricts.get(0).getId();
                    } else {
                        rowValid = false;
                        rowError = "Unknown District code: " + districtCode;
                    }
                } else {
                    districtId = distOpt.get().getId();
                }
            }

            if (rowValid) {
                validCount++;
            } else {
                invalidCount++;
                errors.add(String.format("Row %d (%s): %s", i, projectCode, rowError));
            }

            Map<String, Object> previewMap = new HashMap<>();
            previewMap.put("rowNumber", i);
            previewMap.put("projectId", projectCode);
            previewMap.put("projectName", projectName);
            previewMap.put("stateCode", stateCode);
            previewMap.put("stateId", stateId);
            previewMap.put("districtCode", districtCode);
            previewMap.put("districtId", districtId);
            previewMap.put("category", category);
            previewMap.put("categoryName", category);
            previewMap.put("sanctionedAmount", sanctioned);
            previewMap.put("implementingAgency", agency);
            previewMap.put("isValid", rowValid);
            previewMap.put("error", rowError);
            previewRows.add(previewMap);
        }

        int total = validCount + invalidCount + duplicateCount;
        boolean canProceed = validCount > 0 && invalidCount == 0 && duplicateCount == 0;

        return DataImportResultResponse.builder()
                .batchId(batchId)
                .fileName(fileName)
                .totalRecords(total)
                .validRecords(validCount)
                .invalidRecords(invalidCount)
                .duplicateRecords(duplicateCount)
                .canProceed(canProceed)
                .validationErrors(errors)
                .previewRows(previewRows.stream().limit(50).collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional
    public DataImportResultResponse confirmImport(String batchId, List<ProjectRequest> validRows, UserPrincipal currentUser) {
        if (!"ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only Ministry Administrators can execute Data Imports.");
        }

        if (validRows == null || validRows.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "No valid records provided for import execution.");
        }

        int importedCount = 0;
        List<Project> projectsToSave = new ArrayList<>();

        for (ProjectRequest req : validRows) {
            State state = stateRepository.findById(req.getStateId()).orElse(null);
            District district = districtRepository.findById(req.getDistrictId()).orElse(null);

            if (state == null || district == null) continue;

            Project p = Project.builder()
                    .projectId(req.getProjectId())
                    .projectName(req.getProjectName())
                    .description(req.getDescription())
                    .state(state)
                    .district(district)
                    .implementingAgency(req.getImplementingAgency() != null ? req.getImplementingAgency() : "Public Works")
                    .categoryName(req.getCategoryName() != null ? req.getCategoryName() : "General Infrastructure")
                    .sanctionedAmount(req.getSanctionedAmount() != null ? req.getSanctionedAmount() : 0.0)
                    .releasedAmount(req.getReleasedAmount() != null ? req.getReleasedAmount() : 0.0)
                    .expenditureAmount(req.getExpenditureAmount() != null ? req.getExpenditureAmount() : 0.0)
                    .startDate(req.getStartDate() != null ? req.getStartDate() : LocalDate.now())
                    .expectedCompletionDate(req.getExpectedCompletionDate() != null ? req.getExpectedCompletionDate() : LocalDate.now().plusMonths(12))
                    .physicalProgress(req.getPhysicalProgress() != null ? req.getPhysicalProgress() : 0)
                    .financialProgress(req.getFinancialProgress() != null ? req.getFinancialProgress() : 0.0)
                    .status(ProjectStatus.ONGOING)
                    .riskLevel("LOW")
                    .riskScore(10.0)
                    .delayDays(0)
                    .latitude(req.getLatitude())
                    .longitude(req.getLongitude())
                    .build();

            projectsToSave.add(p);
            importedCount++;
        }

        projectRepository.saveAll(projectsToSave);

        // Record import log
        DataImportRecord record = DataImportRecord.builder()
                .fileName("Batch-" + batchId + ".csv")
                .fileType("CSV")
                .uploadedBy(currentUser.getFullName())
                .totalRecords(validRows.size())
                .validRecords(importedCount)
                .invalidRecords(0)
                .duplicateRecords(0)
                .status("COMPLETED")
                .build();
        importRecordRepository.save(record);

        // Record Audit log
        auditLogRepository.save(AuditLog.builder()
                .action("BULK_DATA_IMPORT")
                .performedBy(currentUser.getFullName() + " (" + currentUser.getEmail() + ")")
                .userRole(currentUser.getRole())
                .details(String.format("Successfully imported %d projects under batch %s.", importedCount, batchId))
                .status("SUCCESS")
                .build());

        return DataImportResultResponse.builder()
                .batchId(batchId)
                .fileName("Batch-" + batchId)
                .totalRecords(validRows.size())
                .validRecords(importedCount)
                .invalidRecords(0)
                .duplicateRecords(0)
                .canProceed(true)
                .validationErrors(Collections.emptyList())
                .previewRows(Collections.emptyList())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DataImportRecord> getImportHistory(UserPrincipal currentUser) {
        if (!"ROLE_MINISTRY_ADMIN".equals(currentUser.getRole())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only Ministry Administrators can view Import history.");
        }
        return importRecordRepository.findAllByOrderByCreatedAtDesc();
    }
}
