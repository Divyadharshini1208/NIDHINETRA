package com.mplads.monitoring.mapper;

import com.mplads.monitoring.dto.response.UserResponse;
import com.mplads.monitoring.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .stateId(user.getState() != null ? user.getState().getId() : null)
                .stateName(user.getState() != null ? user.getState().getName() : null)
                .districtId(user.getDistrict() != null ? user.getDistrict().getId() : null)
                .districtName(user.getDistrict() != null ? user.getDistrict().getName() : null)
                .constituencyId(user.getConstituency() != null ? user.getConstituency().getId() : null)
                .constituencyName(user.getConstituency() != null ? user.getConstituency().getName() : null)
                .organization(user.getOrganization())
                .designation(user.getDesignation())
                .isActive(user.getIsActive())
                .isApproved(user.getIsApproved())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus() : (Boolean.TRUE.equals(user.getIsActive()) ? "ACTIVE" : "PENDING"))
                .clearanceStatus(user.getClearanceStatus() != null ? user.getClearanceStatus() : (Boolean.TRUE.equals(user.getIsApproved()) ? "APPROVED" : "PENDING"))
                .rejectionReason(user.getRejectionReason())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
