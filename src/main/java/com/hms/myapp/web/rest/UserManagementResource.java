package com.hms.myapp.web.rest;

import com.hms.myapp.domain.Authority;
import com.hms.myapp.domain.User;
import com.hms.myapp.repository.AuthorityRepository;
import com.hms.myapp.repository.UserRepository;
import com.hms.myapp.security.AuthoritiesConstants;
import com.hms.myapp.service.AuditLogService;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
public class UserManagementResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserManagementResource.class);

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final AuditLogService auditLogService;

    public UserManagementResource(UserRepository userRepository, AuthorityRepository authorityRepository, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.auditLogService = auditLogService;
    }

    /**
     * {@code GET /users} : get all users.
     *
     * @return the list of users
     */
    @GetMapping("/users")
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        LOG.debug("REST request to get all users for admin management");
        return userRepository.findAllWithAuthoritiesBy().stream().map(UserDTO::new).collect(Collectors.toList());
    }

    /**
     * {@code POST /users/:login/roles} : updates the roles of a user.
     *
     * @param login the login of the user to update
     * @param roles the list of roles to assign
     * @return the updated user
     */
    @PostMapping("/users/{login}/roles")
    @Transactional
    public ResponseEntity<UserDTO> updateUserRoles(@PathVariable("login") String login, @RequestBody List<String> roles) {
        LOG.debug("REST request to update roles for user {}: {}", login, roles);
        List<String> normalizedRoles = new ArrayList<>(roles);
        if (!normalizedRoles.contains(AuthoritiesConstants.USER)) {
            normalizedRoles.add(AuthoritiesConstants.USER);
        }
        return userRepository
            .findOneWithAuthoritiesByLogin(login)
            .map(user -> {
                Set<Authority> authorities = normalizedRoles
                    .stream()
                    .map(authorityRepository::findById)
                    .filter(java.util.Optional::isPresent)
                    .map(java.util.Optional::get)
                    .collect(Collectors.toSet());
                user.setAuthorities(authorities);
                userRepository.save(user);
                auditLogService.logAction("User", null, "UPDATE_ROLES", "Updated roles for " + user.getLogin() + " to " + normalizedRoles);
                return ResponseEntity.ok(new UserDTO(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public static class UserDTO {

        private String id;
        private String login;
        private String firstName;
        private String lastName;
        private String email;
        private boolean activated = false;
        private String langKey;
        private String createdBy;
        private String createdDate;
        private String lastModifiedBy;
        private String lastModifiedDate;
        private Set<String> authorities;

        public UserDTO(User user) {
            this.id = user.getId();
            this.login = user.getLogin();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
            this.activated = user.isActivated();
            this.langKey = user.getLangKey();
            this.createdBy = user.getCreatedBy();
            this.createdDate = user.getCreatedDate() != null ? user.getCreatedDate().toString() : null;
            this.lastModifiedBy = user.getLastModifiedBy();
            this.lastModifiedDate = user.getLastModifiedDate() != null ? user.getLastModifiedDate().toString() : null;
            this.authorities = user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toSet());
        }

        public String getId() {
            return id;
        }

        public String getLogin() {
            return login;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public String getEmail() {
            return email;
        }

        public boolean isActivated() {
            return activated;
        }

        public String getLangKey() {
            return langKey;
        }

        public String getCreatedBy() {
            return createdBy;
        }

        public String getCreatedDate() {
            return createdDate;
        }

        public String getLastModifiedBy() {
            return lastModifiedBy;
        }

        public String getLastModifiedDate() {
            return lastModifiedDate;
        }

        public Set<String> getAuthorities() {
            return authorities;
        }
    }
}
