package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.entity.User;
import com.mplads.monitoring.exception.BadRequestException;
import com.mplads.monitoring.exception.ResourceNotFoundException;
import com.mplads.monitoring.repository.UserRepository;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "Central administrative user governance and clearance")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('MINISTRY_ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    private Map<String, Object> calculateUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPersonnel", userRepository.countTotalUsers());
        stats.put("activeAccounts", userRepository.countActiveUsers());
        stats.put("approvedClearance", userRepository.countApprovedUsers());
        stats.put("pendingApproval", userRepository.countPendingUsers());
        return stats;
    }

    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("email", u.getEmail());
        map.put("fullName", u.getFullName());
        map.put("mobileNumber", u.getMobileNumber());
        map.put("role", u.getRole() != null ? u.getRole().getName().name() : "ROLE_UNKNOWN");
        map.put("organization", u.getOrganization() != null ? u.getOrganization() : "Ministry of Statistics & Programme Implementation");
        map.put("designation", u.getDesignation());
        map.put("stateName", u.getState() != null ? u.getState().getName() : "National");
        map.put("districtName", u.getDistrict() != null ? u.getDistrict().getName() : "-");
        map.put("isActive", Boolean.TRUE.equals(u.getIsActive()));
        map.put("isApproved", Boolean.TRUE.equals(u.getIsApproved()));
        map.put("accountStatus", u.getAccountStatus() != null ? u.getAccountStatus() : (Boolean.TRUE.equals(u.getIsActive()) ? "ACTIVE" : "PENDING"));
        map.put("clearanceStatus", u.getClearanceStatus() != null ? u.getClearanceStatus() : (Boolean.TRUE.equals(u.getIsApproved()) ? "APPROVED" : "PENDING"));
        map.put("rejectionReason", u.getRejectionReason());
        map.put("createdAt", u.getCreatedAt());
        map.put("updatedAt", u.getUpdatedAt());
        return map;
    }

    @GetMapping
    @Operation(summary = "Get all registered users across all roles and jurisdictions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Page<User> usersPage = userRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        
        List<Map<String, Object>> userList = usersPage.getContent().stream()
                .map(this::toUserMap)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", userList);
        response.put("statistics", calculateUserStatistics());
        response.put("totalElements", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("currentPage", usersPage.getNumber());

        return ResponseEntity.ok(ApiResponse.ok("User registry retrieved successfully", response));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get aggregate user statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.ok("User statistics retrieved successfully", calculateUserStatistics()));
    }

    @PutMapping("/{id}/approve")
    @Transactional
    @Operation(summary = "Approve or revoke user account clearance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveUser(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean approved,
            @AuthenticationPrincipal UserPrincipal adminUser) {

        if (adminUser != null && adminUser.getId().equals(id)) {
            throw new BadRequestException("Security Constraint: Ministry Administrators are not permitted to approve or alter clearance on their own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));

        if (approved) {
            user.setIsApproved(true);
            user.setIsActive(true);
            user.setAccountStatus("ACTIVE");
            user.setClearanceStatus("APPROVED");
            user.setRejectionReason(null);
            userRepository.save(user);

            auditLogService.logAction("USER_ACCOUNT_APPROVED", user.getEmail(), "MINISTRY_ADMIN",
                    "Account clearance approved and activated by " + (adminUser != null ? adminUser.getEmail() : "Administrator"),
                    "127.0.0.1", "SUCCESS");
        } else {
            user.setIsApproved(false);
            user.setIsActive(false);
            user.setAccountStatus("REVOKED");
            user.setClearanceStatus("REVOKED");
            userRepository.save(user);

            auditLogService.logAction("USER_ACCOUNT_REVOKED", user.getEmail(), "MINISTRY_ADMIN",
                    "Account clearance revoked by " + (adminUser != null ? adminUser.getEmail() : "Administrator"),
                    "127.0.0.1", "SUCCESS");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("user", toUserMap(user));
        result.put("statistics", calculateUserStatistics());
        return ResponseEntity.ok(ApiResponse.ok(approved ? "User account approved and activated successfully" : "User clearance revoked successfully", result));
    }

    @RequestMapping(value = "/{id}/reject", method = {RequestMethod.PUT, RequestMethod.POST})
    @Transactional
    @Operation(summary = "Reject pending user account clearance application")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectUser(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal adminUser) {

        if (adminUser != null && adminUser.getId().equals(id)) {
            throw new BadRequestException("Security Constraint: Ministry Administrators are not permitted to reject their own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));

        String reason = body != null && body.containsKey("reason") ? body.get("reason") : null;

        user.setIsApproved(false);
        user.setIsActive(false);
        user.setAccountStatus("REJECTED");
        user.setClearanceStatus("REJECTED");
        user.setRejectionReason(reason);
        userRepository.save(user);

        auditLogService.logAction("USER_ACCOUNT_REJECTED", user.getEmail(), "MINISTRY_ADMIN",
                "Account clearance application rejected by " + (adminUser != null ? adminUser.getEmail() : "Administrator") +
                        (reason != null && !reason.isBlank() ? " (Reason: " + reason + ")" : ""),
                "127.0.0.1", "SUCCESS");

        Map<String, Object> result = new HashMap<>();
        result.put("user", toUserMap(user));
        result.put("statistics", calculateUserStatistics());
        return ResponseEntity.ok(ApiResponse.ok("User registration application rejected successfully", result));
    }

    @PutMapping("/{id}/toggle-status")
    @Transactional
    @Operation(summary = "Toggle user active/inactive account status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal adminUser) {

        if (adminUser != null && adminUser.getId().equals(id)) {
            throw new BadRequestException("Security Constraint: Ministry Administrators are not permitted to deactivate or toggle status on their own account.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));

        if (Boolean.TRUE.equals(user.getIsActive())) {
            user.setIsActive(false);
            user.setAccountStatus("INACTIVE");
        } else {
            if (!Boolean.TRUE.equals(user.getIsApproved()) || !"APPROVED".equalsIgnoreCase(user.getClearanceStatus())) {
                throw new BadRequestException("Cannot activate an account that is not approved. Please approve account clearance first.");
            }
            user.setIsActive(true);
            user.setAccountStatus("ACTIVE");
        }
        userRepository.save(user);

        auditLogService.logAction("USER_STATUS_TOGGLED", user.getEmail(), "MINISTRY_ADMIN",
                "Account status toggled to: " + user.getAccountStatus() + " by " + (adminUser != null ? adminUser.getEmail() : "Administrator"),
                "127.0.0.1", "SUCCESS");

        Map<String, Object> result = new HashMap<>();
        result.put("user", toUserMap(user));
        result.put("statistics", calculateUserStatistics());
        return ResponseEntity.ok(ApiResponse.ok("User account status updated successfully", result));
    }
}
