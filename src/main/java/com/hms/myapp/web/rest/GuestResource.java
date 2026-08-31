package com.hms.myapp.web.rest;

import com.hms.myapp.domain.User;
import com.hms.myapp.repository.GuestRepository;
import com.hms.myapp.security.SecurityUtils;
import com.hms.myapp.service.GuestService;
import com.hms.myapp.service.UserService;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hms.myapp.domain.Guest}.
 */
@RestController
@RequestMapping("/api/guests")
public class GuestResource {

    private static final Logger LOG = LoggerFactory.getLogger(GuestResource.class);

    private static final String ENTITY_NAME = "guest";

    @Value("${jhipster.clientApp.name:hotelManagementSystem}")
    private String applicationName;

    private final GuestService guestService;

    private final GuestRepository guestRepository;
    private final UserService userService;

    public GuestResource(GuestService guestService, GuestRepository guestRepository, UserService userService) {
        this.guestService = guestService;
        this.guestRepository = guestRepository;
        this.userService = userService;
    }

    /**
     * {@code POST  /guests} : Create a new guest.
     *
     * @param guestDTO the guestDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new guestDTO, or with status {@code 400 (Bad Request)} if the guest has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<GuestDTO> createGuest(@Valid @RequestBody GuestDTO guestDTO) throws URISyntaxException {
        LOG.debug("REST request to save Guest : {}", guestDTO);
        if (guestDTO.getId() != null) {
            throw new BadRequestAlertException("A new guest cannot already have an ID", ENTITY_NAME, "idexists");
        }
        guestDTO = guestService.save(guestDTO);
        return ResponseEntity.created(new URI("/api/guests/" + guestDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, guestDTO.getId().toString()))
            .body(guestDTO);
    }

    /**
     * {@code PUT  /guests/:id} : Updates an existing guest.
     *
     * @param id the id of the guestDTO to save.
     * @param guestDTO the guestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated guestDTO,
     * or with status {@code 400 (Bad Request)} if the guestDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the guestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<GuestDTO> updateGuest(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody GuestDTO guestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Guest : {}, {}", id, guestDTO);
        if (guestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, guestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!guestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        guestDTO = guestService.update(guestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, guestDTO.getId().toString()))
            .body(guestDTO);
    }

    /**
     * {@code PATCH  /guests/:id} : Partial updates given fields of an existing guest, field will ignore if it is null
     *
     * @param id the id of the guestDTO to save.
     * @param guestDTO the guestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated guestDTO,
     * or with status {@code 400 (Bad Request)} if the guestDTO is not valid,
     * or with status {@code 404 (Not Found)} if the guestDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the guestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<GuestDTO> partialUpdateGuest(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody GuestDTO guestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Guest partially : {}, {}", id, guestDTO);
        if (guestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, guestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!guestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<GuestDTO> result = guestService.partialUpdate(guestDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, guestDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /guests/current} : get the current guest profile.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the guestDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/current")
    public ResponseEntity<GuestDTO> getCurrentGuest() {
        LOG.debug("REST request to get current Guest profile");
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Current user login not found", ENTITY_NAME, "notloggedin")
        );
        Optional<GuestDTO> guestDTO = guestService.findByUserLogin(userLogin);
        return ResponseUtil.wrapOrNotFound(guestDTO);
    }

    /**
     * {@code PUT  /guests/current} : Updates current guest profile.
     *
     * @param guestDTO the guestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated guestDTO,
     * or with status {@code 400 (Bad Request)} if the guestDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the guestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/current")
    public ResponseEntity<GuestDTO> updateCurrentGuest(@Valid @RequestBody GuestDTO guestDTO) throws URISyntaxException {
        LOG.debug("REST request to update current Guest : {}", guestDTO);
        String userLogin = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Current user login not found", ENTITY_NAME, "notloggedin")
        );

        GuestDTO existingGuest = guestService.findByUserLogin(userLogin).orElse(null);
        if (existingGuest == null) {
            // Production quality comment: Create guest if not exists for the current user
            User user = userService.getUserWithAuthoritiesByLogin(userLogin).orElseThrow();
            guestDTO.setUser(new com.hms.myapp.service.dto.UserDTO(user));
            guestDTO = guestService.save(guestDTO);
            return ResponseEntity.created(new URI("/api/guests/" + guestDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, guestDTO.getId().toString()))
                .body(guestDTO);
        }

        guestDTO.setId(existingGuest.getId());
        guestDTO.setUser(existingGuest.getUser()); // keep the same user linked
        guestDTO = guestService.update(guestDTO);

        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, guestDTO.getId().toString()))
            .body(guestDTO);
    }

    /**
     * {@code GET  /guests} : get all the Guests.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Guests in body.
     */
    @GetMapping("")
    public List<GuestDTO> getAllGuests(@RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload) {
        LOG.debug("REST request to get all Guests");
        return guestService.findAll();
    }

    /**
     * {@code GET  /guests/:id} : get the "id" guest.
     *
     * @param id the id of the guestDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the guestDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<GuestDTO> getGuest(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Guest : {}", id);
        Optional<GuestDTO> guestDTO = guestService.findOne(id);
        return ResponseUtil.wrapOrNotFound(guestDTO);
    }

    /**
     * {@code DELETE  /guests/:id} : delete the "id" guest.
     *
     * @param id the id of the guestDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuest(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Guest : {}", id);
        guestService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
