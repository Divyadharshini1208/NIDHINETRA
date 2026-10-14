package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.AgencyReliabilityResponse;

import java.util.List;

public interface AgencyAnalyticsService {

    List<AgencyReliabilityResponse> getAgencyReliabilityLeaderboard();

    AgencyReliabilityResponse getAgencyDetails(String agencyName);
}
