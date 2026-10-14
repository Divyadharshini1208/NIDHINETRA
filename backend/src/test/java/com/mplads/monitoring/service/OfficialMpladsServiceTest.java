package com.mplads.monitoring.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mplads.monitoring.dto.response.OfficialMpladsDataResponse;
import com.mplads.monitoring.service.impl.OfficialMpladsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OfficialMpladsServiceTest {

    private OfficialMpladsServiceImpl officialMpladsService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        officialMpladsService = new OfficialMpladsServiceImpl(objectMapper);
        officialMpladsService.init();
    }

    @Test
    @DisplayName("Cache Warm Response Time: cached official snapshot must return under 100ms")
    void testCacheResponseTimeUnder100ms() {
        long startTime = System.nanoTime();
        OfficialMpladsDataResponse response = officialMpladsService.getOfficialTelemetrySummary();
        long elapsedMs = (System.nanoTime() - startTime) / 1_000_000;

        assertThat(response).isNotNull();
        assertThat(response.isSourceAvailable()).isTrue();
        assertThat(response.getLastSuccessfulRefresh()).isNotNull();
        // Assert that in-memory cache returns in well under 100ms (typically < 1ms)
        assertThat(elapsedMs).isLessThan(100L);
    }

    @Test
    @DisplayName("Data Integrity: verified official snapshot contains official MoSPI figures")
    void testOfficialDataIntegrity() {
        OfficialMpladsDataResponse response = officialMpladsService.getOfficialTelemetrySummary();

        assertThat(response.getWorksRecommendedCount()).isGreaterThan(0L);
        assertThat(response.getWorksSanctionedCount()).isGreaterThan(0L);
        assertThat(response.getWorksCompletedCount()).isGreaterThan(0L);
        assertThat(response.getSourcePortalUrl()).contains("mplads.mospi.gov.in");
    }

    @Test
    @DisplayName("State Telemetry: cached state-level data returns complete non-empty list")
    void testStateTelemetryList() {
        var states = officialMpladsService.getOfficialStates();
        assertThat(states).isNotNull().isNotEmpty();
        assertThat(states.size()).isGreaterThanOrEqualTo(28);
    }
}
