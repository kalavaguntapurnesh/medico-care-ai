package com.medicocareai.backend.dto.notification;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponse {

    private UUID id;

    private String type;

    private String title;

    private String message;

    private String referenceType;

    private UUID referenceId;

    private boolean read;

    private LocalDateTime createdAt;
}
