package com.hms.myapp.service;

import com.hms.myapp.domain.AuditLog;
import com.hms.myapp.repository.AuditLogRepository;
import com.hms.myapp.security.SecurityUtils;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for recording audit logs.
 */
@Service
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Logs an action performed on an entity.
     * @param entityName The name of the entity (e.g., "Booking", "Room")
     * @param entityId The ID of the entity
     * @param action The action performed (e.g., "CREATE", "UPDATE", "DELETE")
     */
    public void logAction(String entityName, Long entityId, String action) {
        // Get the currently logged-in user, default to 'system' if not found
        String user = SecurityUtils.getCurrentUserLogin().orElse("system");

        // Create a new audit log entry
        AuditLog auditLog = new AuditLog(entityName, entityId, action, user, Instant.now());

        // Save the audit log to the database
        auditLogRepository.save(auditLog);
    }
}
