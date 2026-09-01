package com.hms.myapp.service;

import com.hms.myapp.domain.AuditLog;
import com.hms.myapp.repository.AuditLogRepository;
import com.hms.myapp.security.SecurityUtils;
import java.time.Instant;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        logAction(entityName, entityId, action, null);
    }

    public void logAction(String entityName, Long entityId, String action, String details) {
        String user = SecurityUtils.getCurrentUserLogin().orElse("system");
        AuditLog auditLog = new AuditLog(entityName, entityId, action, user, resolveActorRole(), details, Instant.now());

        auditLogRepository.save(auditLog);
    }

    public void logLogin(String login) {
        logLogin(login, resolveActorRole());
    }

    public void logLogin(String login, String actorRole) {
        AuditLog auditLog = new AuditLog("System", null, "LOGIN", login, actorRole, "Signed in to the hotel system", Instant.now());
        auditLogRepository.save(auditLog);
    }

    private String resolveActorRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return "SYSTEM";
        }
        if (
            authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"))
        ) {
            return "ADMIN";
        }
        if (
            authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_RECEPTIONIST"))
        ) {
            return "STAFF";
        }
        if (
            authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_USER"))
        ) {
            return "USER";
        }
        return "SYSTEM";
    }
}
