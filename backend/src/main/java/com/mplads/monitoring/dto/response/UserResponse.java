package com.mplads.monitoring.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String mobileNumber;
    private String role;
    private Long stateId;
    private String stateName;
    private Long districtId;
    private String districtName;
    private Long constituencyId;
    private String constituencyName;
    private String organization;
    private String designation;
    private Boolean isActive;
    private Boolean isApproved;
    private String accountStatus;
    private String clearanceStatus;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
