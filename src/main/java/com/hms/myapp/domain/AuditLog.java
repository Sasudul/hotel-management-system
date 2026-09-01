package com.hms.myapp.domain;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * A simple entity to track audit events like CREATE, UPDATE, DELETE.
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

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "action", nullable = false)
    private String action; // CREATE, UPDATE, DELETE

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "performed_date")
    private Instant performedDate;

    // Default Constructor
    public AuditLog() {}

    public AuditLog(String entityName, Long entityId, String action, String performedBy, Instant performedDate) {
        this.entityName = entityName;
        this.entityId = entityId;
        this.action = action;
        this.performedBy = performedBy;
        this.performedDate = performedDate;
    }

    // Getters and Setters
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

    public Instant getPerformedDate() {
        return performedDate;
    }

    public void setPerformedDate(Instant performedDate) {
        this.performedDate = performedDate;
    }
}
