package com.mplads.monitoring.service.impl;

import com.mplads.monitoring.dto.request.LoginRequest;
import com.mplads.monitoring.dto.request.RegisterRequest;
import com.mplads.monitoring.dto.response.AuthResponse;
import com.mplads.monitoring.dto.response.UserResponse;
import com.mplads.monitoring.entity.*;
import com.mplads.monitoring.exception.BadRequestException;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.mapper.UserMapper;
import com.mplads.monitoring.repository.*;
import com.mplads.monitoring.security.JwtTokenProvider;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuditLogService;
import com.mplads.monitoring.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuthServiceImpl implements AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final StateRepository stateRepository;
        private final DistrictRepository districtRepository;
        private final ConstituencyRepository constituencyRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider tokenProvider;
        private final UserMapper userMapper;
        private final AuditLogService auditLogService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            StateRepository stateRepository,
            DistrictRepository districtRepository,
            ConstituencyRepository constituencyRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            UserMapper userMapper,
            AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.stateRepository = stateRepository;
        this.districtRepository = districtRepository;
        this.constituencyRepository = constituencyRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
        this.auditLogService = auditLogService;
    }


        @Override
        @Transactional
        public AuthResponse login(LoginRequest loginRequest, String ipAddress) {
                String normalizedEmail = loginRequest.getEmail().trim().toLowerCase();
                User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);

                if (existingUser != null) {
                        if ("PENDING".equalsIgnoreCase(existingUser.getClearanceStatus()) ||
                                        "PENDING".equalsIgnoreCase(existingUser.getAccountStatus()) ||
                                        !Boolean.TRUE.equals(existingUser.getIsApproved())) {
                                auditLogService.logAction("LOGIN_BLOCKED_PENDING_APPROVAL", existingUser.getEmail(),
                                                existingUser.getRole().getName().name(),
                                                "Login blocked: Account clearance pending administrator approval",
                                                ipAddress, "BLOCKED");
                                throw new BadRequestException(
                                                "Your account registration is pending approval by the Ministry Administrator. You will be able to log in once your clearance is approved.");
                        }

                        if ("REJECTED".equalsIgnoreCase(existingUser.getAccountStatus()) ||
                                        "REJECTED".equalsIgnoreCase(existingUser.getClearanceStatus())) {
                                auditLogService.logAction("LOGIN_BLOCKED_REJECTED", existingUser.getEmail(),
                                                existingUser.getRole().getName().name(),
                                                "Login blocked: Account registration rejected", ipAddress, "BLOCKED");
                                String reason = existingUser.getRejectionReason() != null
                                                && !existingUser.getRejectionReason().isBlank()
                                                                ? " Reason: " + existingUser.getRejectionReason()
                                                                : "";
                                throw new BadRequestException(
                                                "Your account registration request has been rejected." + reason);
                        }

                        if ("REVOKED".equalsIgnoreCase(existingUser.getAccountStatus()) ||
                                        "REVOKED".equalsIgnoreCase(existingUser.getClearanceStatus())) {
                                auditLogService.logAction("LOGIN_BLOCKED_REVOKED", existingUser.getEmail(),
                                                existingUser.getRole().getName().name(),
                                                "Login blocked: Clearance revoked", ipAddress, "BLOCKED");
                                throw new BadRequestException(
                                                "Your access clearance has been revoked by the Ministry Administrator. Access is denied.");
                        }

                        if (!Boolean.TRUE.equals(existingUser.getIsActive()) ||
                                        "INACTIVE".equalsIgnoreCase(existingUser.getAccountStatus())) {
                                auditLogService.logAction("LOGIN_BLOCKED_INACTIVE", existingUser.getEmail(),
                                                existingUser.getRole().getName().name(),
                                                "Login blocked: Account deactivated", ipAddress, "BLOCKED");
                                throw new BadRequestException(
                                                "Your account has been deactivated. Please contact your administrative authority.");
                        }
                }

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                normalizedEmail,
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = tokenProvider.generateToken(authentication);

                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                User user = userRepository.findById(userPrincipal.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                auditLogService.logAction(
                                "USER_LOGIN",
                                user.getEmail(),
                                user.getRole().getName().name(),
                                "User successfully authenticated into MPLADS Monitoring Portal",
                                ipAddress,
                                "SUCCESS");

                return AuthResponse.builder()
                                .accessToken(jwt)
                                .tokenType("Bearer")
                                .expiresInMs(tokenProvider.getExpirationInMs())
                                .user(userMapper.toUserResponse(user))
                                .build();
        }

        @Override
        @Transactional
        public UserResponse register(RegisterRequest registerRequest, String ipAddress) {
                String email = registerRequest.getEmail().trim().toLowerCase();

                if (userRepository.existsByEmail(email)) {
                        auditLogService.logAction("REGISTRATION_ATTEMPT_FAILED", email, "UNKNOWN",
                                        "Email already exists in system", ipAddress, "FAILED");
                        throw new BadRequestException(
                                        "An account with email '" + email + "' is already registered in the portal.");
                }

                if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
                        throw new BadRequestException("Password and Confirm Password do not match.");
                }

                // Security check: Normal users cannot self-assign MINISTRY_ADMIN
                String requestedRoleStr = registerRequest.getRole().trim().toUpperCase();
                if (requestedRoleStr.contains("MINISTRY_ADMIN") || requestedRoleStr.equals("ROLE_MINISTRY_ADMIN")) {
                        auditLogService.logAction("PRIVILEGE_ESCALATION_BLOCKED", email, requestedRoleStr,
                                        "Attempted self-assignment of MINISTRY_ADMIN role", ipAddress, "WARNING");
                        throw new BadRequestException(
                                        "Privileged Ministry Admin access cannot be self-assigned. Such accounts require official MoSPI administrative provisioning.");
                }

                RoleName roleName;
                try {
                        if (!requestedRoleStr.startsWith("ROLE_")) {
                                requestedRoleStr = "ROLE_" + requestedRoleStr;
                        }
                        roleName = RoleName.valueOf(requestedRoleStr);
                } catch (IllegalArgumentException ex) {
                        throw new BadRequestException(
                                        "Invalid role selected. Allowed roles: STATE_NODAL_AUTHORITY, DISTRICT_AUTHORITY, MP");
                }

                Role role = roleRepository.findByName(roleName)
                                .orElseThrow(() -> new ResourceNotFoundException("Role not configured: " + roleName));

                User user = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode(registerRequest.getPassword()))
                                .fullName(registerRequest.getFullName().trim())
                                .mobileNumber(registerRequest.getMobileNumber().trim())
                                .role(role)
                                .organization(registerRequest.getOrganization().trim())
                                .designation(registerRequest.getDesignation().trim())
                                .isActive(false)
                                .isApproved(false)
                                .accountStatus("PENDING")
                                .clearanceStatus("PENDING")
                                .build();

                if (registerRequest.getStateId() != null) {
                        State state = stateRepository.findById(registerRequest.getStateId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "State not found with id: " + registerRequest.getStateId()));
                        user.setState(state);
                }

                if (registerRequest.getDistrictId() != null) {
                        District district = districtRepository.findById(registerRequest.getDistrictId())
                                        .orElseThrow(() -> new ResourceNotFoundException("District not found with id: "
                                                        + registerRequest.getDistrictId()));
                        user.setDistrict(district);
                }

                if (registerRequest.getConstituencyId() != null) {
                        Constituency constituency = constituencyRepository.findById(registerRequest.getConstituencyId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Constituency not found with id: "
                                                                        + registerRequest.getConstituencyId()));
                        user.setConstituency(constituency);
                }

                User savedUser = userRepository.save(user);

                auditLogService.logAction(
                                "USER_REGISTRATION",
                                savedUser.getEmail(),
                                role.getName().name(),
                                "New user registered with role: " + role.getName().name()
                                                + " (Pending administrative clearance)",
                                ipAddress,
                                "PENDING");

                return userMapper.toUserResponse(savedUser);
        }
}
