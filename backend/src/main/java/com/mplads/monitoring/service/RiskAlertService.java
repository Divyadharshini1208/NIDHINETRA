package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.AiAnalysisPreviewResponse;
import com.mplads.monitoring.dto.response.AiMonitoringSummaryResponse;
import com.mplads.monitoring.dto.response.PagedResponse;
import com.mplads.monitoring.dto.response.RiskAlertResponse;
import com.mplads.monitoring.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface RiskAlertService {

    PagedResponse<RiskAlertResponse> getAlerts(
            String severity,
            String alertType,
            String status,
            Long stateId,
            Long districtId,
            String search,
            UserPrincipal currentUser,
            Pageable pageable
    );

    RiskAlertResponse getAlertById(Long alertId, UserPrincipal currentUser);

    RiskAlertResponse updateStatus(Long alertId, String newStatus, String resolutionNotes, UserPrincipal currentUser);

    RiskAlertResponse assignAlert(Long alertId, String assigneeName, UserPrincipal currentUser);

    RiskAlertResponse addInvestigationNote(Long alertId, String noteText, UserPrincipal currentUser);

    RiskAlertResponse escalateAlert(Long alertId, String escalationReason, UserPrincipal currentUser);

    AiAnalysisPreviewResponse analyzeProjectOnDemand(Long projectId, UserPrincipal currentUser);

    AiMonitoringSummaryResponse getMonitoringSummary(UserPrincipal currentUser);

    Map<String, Object> checkDuplicates(Long projectId, UserPrincipal currentUser);
}
