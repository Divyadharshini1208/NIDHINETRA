package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.OfficialMpladsDataResponse;

import java.util.List;
import java.util.Map;

public interface OfficialMpladsService {
    OfficialMpladsDataResponse getOfficialTelemetrySummary();
    List<Map<String, Object>> getOfficialStates();
    OfficialMpladsDataResponse refreshOfficialTelemetry();
}
