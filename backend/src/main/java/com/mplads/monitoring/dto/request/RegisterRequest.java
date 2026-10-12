package com.mplads.monitoring.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 150, message = "Full Name must be between 2 and 150 characters")
    private String fullName;

    @NotBlank(message = "Official Email is required")
    @Email(message = "Valid official email address is required")
    private String email;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian mobile number")
    private String mobileNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Confirm Password is required")
    private String confirmPassword;

    @NotBlank(message = "Role is required")
    private String role; // STATE_NODAL_AUTHORITY, DISTRICT_AUTHORITY, MP

    private Long stateId;

    private Long districtId;

    private Long constituencyId;

    @NotBlank(message = "Organization is required")
    private String organization;

    @NotBlank(message = "Designation is required")
    private String designation;
}
