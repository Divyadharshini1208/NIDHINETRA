package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.ReportPreviewResponse;
import com.mplads.monitoring.security.UserPrincipal;

import java.time.LocalDate;

public interface ReportService {

    ReportPreviewResponse generateReportPreview(
            String reportType,
            Long stateId,
            Long districtId,
            LocalDate fromDate,
            LocalDate toDate,
            UserPrincipal currentUser
    );
}
