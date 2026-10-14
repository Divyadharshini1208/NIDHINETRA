package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.AssignInspectionRequest;
import com.mplads.monitoring.dto.request.InspectionOutcomeRequest;
import com.mplads.monitoring.dto.response.InspectionQueueItemResponse;
import com.mplads.monitoring.dto.response.WeeklyInspectionSummaryResponse;
import com.mplads.monitoring.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CollectorInspectionService {

    Page<InspectionQueueItemResponse> getInspectionQueue(UserPrincipal currentUser, Long districtId, Pageable pageable);

    InspectionQueueItemResponse assignInspection(UserPrincipal currentUser, AssignInspectionRequest request);

    InspectionQueueItemResponse recordInspectionOutcome(UserPrincipal currentUser, InspectionOutcomeRequest request);

    WeeklyInspectionSummaryResponse getWeeklySummary(UserPrincipal currentUser, Long districtId);
}
