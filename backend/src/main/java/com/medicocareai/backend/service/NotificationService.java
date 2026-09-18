package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.notification.CreateNotificationRequest;
import com.medicocareai.backend.dto.notification.NotificationResponse;
import com.medicocareai.backend.entity.Notification;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.NotificationRepository;
import com.medicocareai.backend.repository.UserRepository;
import com.medicocareai.backend.security.CustomUserPrincipal;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponse createNotification(
            CreateNotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setReferenceType(request.getReferenceType());
        notification.setReferenceId(request.getReferenceId());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(
            CustomUserPrincipal principal) {
        UUID userId = principal.getUserId();

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyUnreadNotifications(CustomUserPrincipal principal) {
        UUID userId = principal.getUserId();

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public NotificationResponse markAsRead(
            CustomUserPrincipal principal,
            UUID notificationId) {

        UUID userId = principal.getUserId();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found"));

        /*
         * Ownership check.
         *
         * A user can only mark their own notification as read.
         */
        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException(
                    "Notification not found");
        }

        notification.setRead(true);

        Notification saved = notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    public void markAllAsRead(
            CustomUserPrincipal principal) {

        UUID userId = principal.getUserId();

        List<Notification> notifications = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse mapToResponse(
            Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

}
