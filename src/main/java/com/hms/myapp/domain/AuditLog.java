package com.hms.myapp.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * Records important hotel system activity for administrators.
 */
@Entity
@Table(name = "audit_log")
public class AuditLog implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name", nullable = false)
    private String entityName;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "actor_role")
    private String actorRole;

    @Column(name = "details", length = 1000)
    private String details;

    @Column(name = "performed_date")
    private Instant performedDate;

    public AuditLog() {}

    public AuditLog(String entityName, Long entityId, String action, String performedBy, Instant performedDate) {
        this(entityName, entityId, action, performedBy, null, null, performedDate);
    }

    public AuditLog(
        String entityName,
        Long entityId,
        String action,
        String performedBy,
        String actorRole,
        String details,
        Instant performedDate
    ) {
        this.entityName = entityName;
        this.entityId = entityId;
        this.action = action;
        this.performedBy = performedBy;
        this.actorRole = actorRole;
        this.details = details;
        this.performedDate = performedDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public Long getEntityId() {
        return entityId;
    }

    public void setEntityId(Long entityId) {
        this.entityId = entityId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getPerformedDate() {
        return performedDate;
    }

    public void setPerformedDate(Instant performedDate) {
        this.performedDate = performedDate;
    }
}
