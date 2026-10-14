package com.mplads.monitoring.controller;

import com.mplads.monitoring.dto.response.ApiResponse;
import com.mplads.monitoring.dto.response.RiskNotificationResponse;
import com.mplads.monitoring.security.UserPrincipal;
import com.mplads.monitoring.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Real-Time Risk Notifications", description = "Server-Sent Events (SSE) and notification ledger for high-priority risk triggers")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Real-time SSE Notification Stream", description = "Subscribe to live real-time risk alert push notifications")
    @PreAuthorize("isAuthenticated()")
    public SseEmitter streamNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        return notificationService.createSseEmitter(currentUser);
    }

    @GetMapping
    @Operation(summary = "Get notification history", description = "Get paged list of past risk notifications scoped to user authority")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<RiskNotificationResponse>>> getNotifications(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RiskNotificationResponse> notifications = notificationService.getNotifications(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Returns total count of unread high-priority notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        long unread = notificationService.getUnreadCount(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("unreadCount", unread)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal currentUser) {
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
