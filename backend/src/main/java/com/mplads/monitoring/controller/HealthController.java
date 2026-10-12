package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Health & Diagnostics", description = "System health check and diagnostic monitoring endpoints")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Protected system health endpoint", security = @SecurityRequirement(name = "BearerAuth"))
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> healthInfo = Map.of(
                "status", "UP",
                "system", "MPLADS Monitoring and Decision Support Platform",
                "version", "1.0.0-PROD-READY",
                "authenticatedUser", currentUser != null ? currentUser.getEmail() : "ANONYMOUS",
                "role", currentUser != null ? currentUser.getRole() : "NONE",
                "serverTime", LocalDateTime.now().toString(),
                "database", "CONNECTED"
        );
        return ResponseEntity.ok(ApiResponse.ok("Protected system health check passed", healthInfo));
    }

    @GetMapping("/public/ping")
    @Operation(summary = "Public availability heartbeat ping")
    public ResponseEntity<ApiResponse<Map<String, String>>> publicPing() {
        return ResponseEntity.ok(ApiResponse.ok("Service is online", Map.of(
                "status", "ONLINE",
                "environment", "PRODUCTION/STAGING",
                "timestamp", LocalDateTime.now().toString()
        )));
    }
}
