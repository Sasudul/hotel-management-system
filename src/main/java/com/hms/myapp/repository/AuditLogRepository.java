package com.hms.myapp.repository;

import com.hms.myapp.domain.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the AuditLog entity.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByPerformedDateDesc(Pageable pageable);

    Page<AuditLog> findAllByEntityNameOrderByPerformedDateDesc(String entityName, Pageable pageable);

    Page<AuditLog> findAllByEntityNameAndActorRoleOrderByPerformedDateDesc(String entityName, String actorRole, Pageable pageable);
}
