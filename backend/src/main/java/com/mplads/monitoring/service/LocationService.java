package com.mplads.monitoring.service;

import com.mplads.monitoring.dto.response.LocationDto;

import java.util.List;

public interface LocationService {
    List<LocationDto.StateDto> getAllStates();
    List<LocationDto.DistrictDto> getDistrictsByState(Long stateId);
    List<LocationDto.ConstituencyDto> getConstituenciesByDistrict(Long districtId);
}
