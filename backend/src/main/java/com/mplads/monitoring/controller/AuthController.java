package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.request.LoginRequest;
import com.mplads.monitoring.dto.request.RegisterRequest;
import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.AuthResponse;
import com.mplads.monitoring.dto.response.UserResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.AuthService;
import com.mplads.monitoring.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Authorization", description = "Endpoints for user authentication, registration, and profile retrieval")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        AuthResponse authResponse = authService.login(loginRequest, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new official stakeholder account")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody RegisterRequest registerRequest,
            HttpServletRequest request) {
        String clientIp = getClientIp(request);
        UserResponse userResponse = authService.register(registerRequest, clientIp);
        return new ResponseEntity<>(ApiResponse.ok("Registration successful. Account created.", userResponse), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user details")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse userResponse = userService.getCurrentUserProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Profile fetched successfully", userResponse));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
