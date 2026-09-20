package com.medicocareai.backend.dto.audit;

import java.util.UUID;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateAuditLogRequest {
    private UUID userId;

    private String action;

    private String entityType;

    private UUID entityId;

    private String ipAddress;

    private String userAgent;

    private String metadata;
}
