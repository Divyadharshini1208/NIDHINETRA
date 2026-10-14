package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.response.LocationDto;
import com.mplads.monitoring.entity.Constituency;
import com.mplads.monitoring.entity.District;
import com.mplads.monitoring.entity.State;
import com.mplads.monitoring.repository.ConstituencyRepository;
import com.mplads.monitoring.repository.DistrictRepository;
import com.mplads.monitoring.repository.StateRepository;
import com.mplads.monitoring.service.LocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationServiceImpl implements LocationService {

    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final ConstituencyRepository constituencyRepository;

    public LocationServiceImpl(
            StateRepository stateRepository,
            DistrictRepository districtRepository,
            ConstituencyRepository constituencyRepository) {
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.constituencyRepository = constituencyRepository;
    }


    @Override
    @Transactional(readOnly = true)
    public List<LocationDto.StateDto> getAllStates() {
        return stateRepository.findAll().stream()
                .map(this::mapStateToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDto.DistrictDto> getDistrictsByState(Long stateId) {
        return districtRepository.findByStateId(stateId).stream()
                .map(this::mapDistrictToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationDto.ConstituencyDto> getConstituenciesByDistrict(Long districtId) {
        return constituencyRepository.findByDistrictId(districtId).stream()
                .map(this::mapConstituencyToDto)
                .collect(Collectors.toList());
    }

    private LocationDto.StateDto mapStateToDto(State state) {
        return LocationDto.StateDto.builder()
                .id(state.getId())
                .code(state.getCode())
                .name(state.getName())
                .totalSanctionedCr(state.getTotalSanctionedCr())
                .totalExpenditureCr(state.getTotalExpenditureCr())
                .activeProjectsCount(state.getActiveProjectsCount())
                .build();
    }

    private LocationDto.DistrictDto mapDistrictToDto(District district) {
        return LocationDto.DistrictDto.builder()
                .id(district.getId())
                .code(district.getCode())
                .name(district.getName())
                .stateId(district.getState().getId())
                .stateName(district.getState().getName())
                .headquarters(district.getHeadquarters())
                .build();
    }

    private LocationDto.ConstituencyDto mapConstituencyToDto(Constituency constituency) {
        return LocationDto.ConstituencyDto.builder()
                .id(constituency.getId())
                .code(constituency.getCode())
                .name(constituency.getName())
                .districtId(constituency.getDistrict().getId())
                .districtName(constituency.getDistrict().getName())
                .houseType(constituency.getHouseType())
                .mpName(constituency.getMpName())
                .build();
    }
}
