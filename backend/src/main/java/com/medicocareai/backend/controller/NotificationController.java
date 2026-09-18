package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.notification.NotificationResponse;
import com.medicocareai.backend.security.CustomUserPrincipal;
import com.medicocareai.backend.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getMyNotifications(principal));
    }

    @GetMapping("/me/unread")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getMyUnreadNotifications(principal));
    }

    @PatchMapping("/me/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @PathVariable UUID notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(principal, notificationId));
    }

    @PatchMapping("/me/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        notificationService.markAllAsRead(principal);
        return ResponseEntity.noContent().build();
    }
}
