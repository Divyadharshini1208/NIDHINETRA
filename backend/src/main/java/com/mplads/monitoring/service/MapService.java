package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.ProjectResponse;
import com.mplads.monitoring.security.UserPrincipal;

import java.util.List;

public interface MapService {

    List<ProjectResponse> getMapProjects(
            UserPrincipal currentUser,
            Long stateId,
            Long districtId,
            String status,
            String riskLevel,
            String category
    );
}
