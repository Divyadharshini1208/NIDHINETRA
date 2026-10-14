package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.request.SimulationEvaluateRequest;
import com.mplads.monitoring.dto.response.SimulationResultResponse;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;

public interface FundSimulationService {

    SimulationResultResponse evaluateScenario(UserPrincipal currentUser, SimulationEvaluateRequest request);

    SimulationResultResponse saveScenario(UserPrincipal currentUser, SimulationEvaluateRequest request);

    List<SimulationResultResponse> getSavedScenarios(UserPrincipal currentUser);
}
