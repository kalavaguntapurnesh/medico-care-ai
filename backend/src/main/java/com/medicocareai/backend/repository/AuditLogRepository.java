package com.medicocareai.backend.repository;

import com.medicocareai.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, UUID> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AuditLog> findByEntityTypeAndEntityId(
            String entityType,
            UUID entityId
    );

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);
}
