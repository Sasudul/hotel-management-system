package com.hms.myapp.web.rest;

import static com.hms.myapp.domain.GuestAsserts.*;
import static com.hms.myapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.myapp.IntegrationTest;
import com.hms.myapp.domain.Guest;
import com.hms.myapp.domain.User;
import com.hms.myapp.repository.GuestRepository;
import com.hms.myapp.repository.UserRepository;
import com.hms.myapp.service.GuestService;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.service.mapper.GuestMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link GuestResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class GuestResourceIT {

    private static final String DEFAULT_PHONE = "451091+";
    private static final String UPDATED_PHONE = "4-397745 98 8280 83";

    private static final String DEFAULT_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS = "BBBBBBBBBB";

    private static final String DEFAULT_ID_DOCUMENT_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_ID_DOCUMENT_NUMBER = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/guests";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private GuestRepository guestRepositoryMock;

    @Autowired
    private GuestMapper guestMapper;

    @Mock
    private GuestService guestServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGuestMockMvc;

    private Guest guest;

    private Guest insertedGuest;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Guest createEntity(EntityManager em) {
        Guest guest = new Guest().phone(DEFAULT_PHONE).address(DEFAULT_ADDRESS).idDocumentNumber(DEFAULT_ID_DOCUMENT_NUMBER);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        guest.setUser(user);
        return guest;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Guest createUpdatedEntity(EntityManager em) {
        Guest updatedGuest = new Guest().phone(UPDATED_PHONE).address(UPDATED_ADDRESS).idDocumentNumber(UPDATED_ID_DOCUMENT_NUMBER);
        // Add required entity
        User user = UserResourceIT.createEntity();
        em.persist(user);
        em.flush();
        updatedGuest.setUser(user);
        return updatedGuest;
    }

    @BeforeEach
    void initTest() {
        guest = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedGuest != null) {
            guestRepository.delete(insertedGuest);
            insertedGuest = null;
        }
        userRepository.deleteAll();
    }

    @Test
    @Transactional
    void createGuest() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);
        var returnedGuestDTO = om.readValue(
            restGuestMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(guestDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            GuestDTO.class
        );

        // Validate the Guest in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedGuest = guestMapper.toEntity(returnedGuestDTO);
        assertGuestUpdatableFieldsEquals(returnedGuest, getPersistedGuest(returnedGuest));

        insertedGuest = returnedGuest;
    }

    @Test
    @Transactional
    void createGuestWithExistingId() throws Exception {
        // Create the Guest with an existing ID
        guest.setId(1L);
        GuestDTO guestDTO = guestMapper.toDto(guest);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGuestMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(guestDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPhoneIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        guest.setPhone(null);

        // Create the Guest, which fails.
        GuestDTO guestDTO = guestMapper.toDto(guest);

        restGuestMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(guestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIdDocumentNumberIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        guest.setIdDocumentNumber(null);

        // Create the Guest, which fails.
        GuestDTO guestDTO = guestMapper.toDto(guest);

        restGuestMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(guestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllGuests() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        // Get all the guestList
        restGuestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(guest.getId().intValue())))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].idDocumentNumber").value(hasItem(DEFAULT_ID_DOCUMENT_NUMBER)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllGuestsWithEagerRelationshipsIsEnabled() throws Exception {
        when(guestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restGuestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(guestServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllGuestsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(guestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restGuestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(guestRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getGuest() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        // Get the guest
        restGuestMockMvc
            .perform(get(ENTITY_API_URL_ID, guest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(guest.getId().intValue()))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE))
            .andExpect(jsonPath("$.address").value(DEFAULT_ADDRESS))
            .andExpect(jsonPath("$.idDocumentNumber").value(DEFAULT_ID_DOCUMENT_NUMBER));
    }

    @Test
    @Transactional
    void getNonExistingGuest() throws Exception {
        // Get the guest
        restGuestMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingGuest() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the guest
        Guest updatedGuest = guestRepository.findById(guest.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedGuest are not directly saved in db
        em.detach(updatedGuest);
        updatedGuest.phone(UPDATED_PHONE).address(UPDATED_ADDRESS).idDocumentNumber(UPDATED_ID_DOCUMENT_NUMBER);
        GuestDTO guestDTO = guestMapper.toDto(updatedGuest);

        restGuestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, guestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(guestDTO))
            )
            .andExpect(status().isOk());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedGuestToMatchAllProperties(updatedGuest);
    }

    @Test
    @Transactional
    void putNonExistingGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, guestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(guestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(guestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(guestDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGuestWithPatch() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the guest using partial update
        Guest partialUpdatedGuest = new Guest();
        partialUpdatedGuest.setId(guest.getId());

        partialUpdatedGuest.phone(UPDATED_PHONE);

        restGuestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGuest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGuest))
            )
            .andExpect(status().isOk());

        // Validate the Guest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGuestUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedGuest, guest), getPersistedGuest(guest));
    }

    @Test
    @Transactional
    void fullUpdateGuestWithPatch() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the guest using partial update
        Guest partialUpdatedGuest = new Guest();
        partialUpdatedGuest.setId(guest.getId());

        partialUpdatedGuest.phone(UPDATED_PHONE).address(UPDATED_ADDRESS).idDocumentNumber(UPDATED_ID_DOCUMENT_NUMBER);

        restGuestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGuest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedGuest))
            )
            .andExpect(status().isOk());

        // Validate the Guest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertGuestUpdatableFieldsEquals(partialUpdatedGuest, getPersistedGuest(partialUpdatedGuest));
    }

    @Test
    @Transactional
    void patchNonExistingGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, guestDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(guestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(guestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGuest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        guest.setId(longCount.incrementAndGet());

        // Create the Guest
        GuestDTO guestDTO = guestMapper.toDto(guest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGuestMockMvc
            .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(guestDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Guest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGuest() throws Exception {
        // Initialize the database
        insertedGuest = guestRepository.saveAndFlush(guest);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the guest
        restGuestMockMvc
            .perform(delete(ENTITY_API_URL_ID, guest.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return guestRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Guest getPersistedGuest(Guest guest) {
        return guestRepository.findById(guest.getId()).orElseThrow();
    }

    protected void assertPersistedGuestToMatchAllProperties(Guest expectedGuest) {
        assertGuestAllPropertiesEquals(expectedGuest, getPersistedGuest(expectedGuest));
    }

    protected void assertPersistedGuestToMatchUpdatableProperties(Guest expectedGuest) {
        assertGuestAllUpdatablePropertiesEquals(expectedGuest, getPersistedGuest(expectedGuest));
    }
}
