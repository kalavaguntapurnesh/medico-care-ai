package com.medicocareai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.medicocareai.backend.dto.audit.AuditLogResponse;
import com.medicocareai.backend.dto.audit.CreateAuditLogRequest;
import com.medicocareai.backend.entity.AuditLog;
import com.medicocareai.backend.entity.User;
import com.medicocareai.backend.exception.ResourceNotFoundException;
import com.medicocareai.backend.repository.AuditLogRepository;
import com.medicocareai.backend.repository.UserRepository;

@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    /*
     * Internal method used by application services
     * to create audit records.
     */
    public AuditLogResponse createAuditLog(
            CreateAuditLogRequest request) {

        AuditLog auditLog = new AuditLog();

        if (request.getUserId() != null) {

            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found"));

            auditLog.setUser(user);
        }

        auditLog.setAction(request.getAction());
        auditLog.setEntityType(request.getEntityType());
        auditLog.setEntityId(request.getEntityId());
        auditLog.setIpAddress(request.getIpAddress());
        auditLog.setUserAgent(request.getUserAgent());
        auditLog.setMetadata(request.getMetadata());
        auditLog.setCreatedAt(LocalDateTime.now());

        AuditLog savedAuditLog = auditLogRepository.save(auditLog);

        return mapToResponse(savedAuditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository.findAll()
                .stream()
                .sorted((first, second) -> second.getCreatedAt()
                        .compareTo(first.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByUser(
            UUID userId) {

        return auditLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByEntity(
            String entityType,
            UUID entityId) {

        return auditLogRepository
                .findByEntityTypeAndEntityId(
                        entityType,
                        entityId)
                .stream()
                .sorted((first, second) -> second.getCreatedAt()
                        .compareTo(first.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByAction(
            String action) {

        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(action)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AuditLogResponse mapToResponse(
            AuditLog auditLog) {

        AuditLogResponse response = new AuditLogResponse();

        response.setId(auditLog.getId());

        if (auditLog.getUser() != null) {
            response.setUserId(
                    auditLog.getUser().getId());

            response.setUserEmail(
                    auditLog.getUser().getEmail());
        }

        response.setAction(auditLog.getAction());
        response.setEntityType(
                auditLog.getEntityType());
        response.setEntityId(
                auditLog.getEntityId());
        response.setIpAddress(
                auditLog.getIpAddress());
        response.setUserAgent(
                auditLog.getUserAgent());
        response.setMetadata(
                auditLog.getMetadata());
        response.setCreatedAt(
                auditLog.getCreatedAt());

        return response;
    }

    public void log(
        UUID userId,
        String action,
        String entityType,
        UUID entityId,
        String ipAddress,
        String userAgent,
        String metadata

    ){
        CreateAuditLogRequest request = new CreateAuditLogRequest();

        request.setUserId(userId);
        request.setAction(action);
        request.setEntityType(entityType);
        request.setEntityId(entityId);
        request.setIpAddress(ipAddress);
        request.setUserAgent(userAgent);
        request.setMetadata(metadata);
        createAuditLog(request);
    }
}