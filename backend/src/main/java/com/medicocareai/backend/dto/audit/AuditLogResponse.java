package com.medicocareai.backend.dto.audit;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AuditLogResponse {

    private UUID id;

    private UUID userId;

    private String userEmail;

    private String action;

    private String entityType;

    private UUID entityId;

    private String ipAddress;

    private String userAgent;

    private String metadata;

    private LocalDateTime createdAt;
}
