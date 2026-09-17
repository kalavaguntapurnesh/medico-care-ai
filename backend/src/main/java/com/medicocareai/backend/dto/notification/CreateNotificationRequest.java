package com.medicocareai.backend.dto.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateNotificationRequest {

    private UUID userId;

    @NotBlank(message = "Notification type is required")
    @Size(max = 50, message = "Notification type must not exceed 50 characters")
    private String type;

    @NotBlank(message = "Notification title is required")
    @Size(max = 255, message = "Notification title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Notification message is required")
    private String message;

    @Size(max = 50, message = "Reference type must not exceed 50 characters")
    private String referenceType;

    private UUID referenceId;
}