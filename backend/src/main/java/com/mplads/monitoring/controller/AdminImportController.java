package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.DataImportResultResponse;
import com.mplads.monitoring.entity.DataImportRecord;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AdminDataImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
@Tag(name = "Admin Data Import", description = "Endpoints for bulk CSV/Excel validation, preview, and execution (Ministry Admin only)")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('MINISTRY_ADMIN')")
public class AdminImportController {

    private final AdminDataImportService importService;

    @PostMapping(value = "/validate", consumes = {"multipart/form-data"})
    @Operation(summary = "Upload and validate CSV file without saving to database")
    public ResponseEntity<ApiResponse<DataImportResultResponse>> validateFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) throws Exception {
        String content = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                .lines().collect(Collectors.joining("\n"));

        DataImportResultResponse response = importService.validateCsvData(file.getOriginalFilename(), content, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Validation completed", response));
    }

    @PostMapping("/validate-raw")
    @Operation(summary = "Validate raw CSV string payload")
    public ResponseEntity<ApiResponse<DataImportResultResponse>> validateRaw(
            @RequestBody RawCsvImportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        DataImportResultResponse response = importService.validateCsvData(request.getFileName(), request.getCsvContent(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Validation completed", response));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm and commit validated records to database")
    public ResponseEntity<ApiResponse<DataImportResultResponse>> confirmImport(
            @RequestBody ConfirmImportRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        DataImportResultResponse response = importService.confirmImport(request.getBatchId(), request.getValidRows(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Data import confirmed and executed successfully", response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get historical record of past bulk imports")
    public ResponseEntity<ApiResponse<List<DataImportRecord>>> getHistory(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        List<DataImportRecord> response = importService.getImportHistory(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Import history retrieved", response));
    }

    @Getter
    @Setter
    public static class RawCsvImportRequest {
        private String fileName;
        private String csvContent;
    }

    @Getter
    @Setter
    public static class ConfirmImportRequest {
        private String batchId;
        private List<ProjectRequest> validRows;
    }
}
