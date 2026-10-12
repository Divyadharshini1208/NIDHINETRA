package com.mplads.monitoring.dto.response;

import lombok.*;

import java.util.List;

public class LocationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StateDto {
        private Long id;
        private String code;
        private String name;
        private Double totalSanctionedCr;
        private Double totalExpenditureCr;
        private Integer activeProjectsCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DistrictDto {
        private Long id;
        private String code;
        private String name;
        private Long stateId;
        private String stateName;
        private String headquarters;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConstituencyDto {
        private Long id;
        private String code;
        private String name;
        private Long districtId;
        private String districtName;
        private String houseType;
        private String mpName;
    }
}
