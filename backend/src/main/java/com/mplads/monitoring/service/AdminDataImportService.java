package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.ProjectRequest;
import com.mplads.monitoring.dto.response.DataImportResultResponse;
import com.mplads.monitoring.entity.DataImportRecord;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;

public interface AdminDataImportService {

    DataImportResultResponse validateCsvData(String fileName, String csvContent, UserPrincipal currentUser);

    DataImportResultResponse confirmImport(String batchId, List<ProjectRequest> validRows, UserPrincipal currentUser);

    List<DataImportRecord> getImportHistory(UserPrincipal currentUser);
}
