package com.hms.myapp.web.rest;

import com.hms.myapp.domain.AuditLog;
import com.hms.myapp.repository.AuditLogRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

/**
 * REST controller for managing {@link com.hms.myapp.domain.AuditLog}.
 */
@RestController
@RequestMapping("/api/admin/audits")
public class AuditLogResource {

    private static final Logger LOG = LoggerFactory.getLogger(AuditLogResource.class);

    private final AuditLogRepository auditLogRepository;

    public AuditLogResource(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * {@code GET  /api/admin/audits} : get all the audit logs.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of audit logs in body.
     */
    @GetMapping("")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Audit Logs");
        Page<AuditLog> page = auditLogRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/system")
    public ResponseEntity<List<AuditLog>> getSystemLogs(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "actorRole", required = false) String actorRole
    ) {
        LOG.debug("REST request to get a page of System Logs for role {}", actorRole);
        Page<AuditLog> page =
            actorRole == null || actorRole.isBlank()
                ? auditLogRepository.findAllByEntityName("System", pageable)
                : auditLogRepository.findAllByEntityNameAndActorRole("System", actorRole, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
