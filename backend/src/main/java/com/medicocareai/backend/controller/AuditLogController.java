package com.medicocareai.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicocareai.backend.dto.audit.AuditLogResponse;
import com.medicocareai.backend.service.AuditLogService;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByUser(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByUser(userId)
        );
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByEntity(
                        entityType,
                        entityId
                )
        );
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByAction(
            @PathVariable String action) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByAction(action)
        );
    }
}