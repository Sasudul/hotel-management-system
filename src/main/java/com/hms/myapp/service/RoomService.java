package com.hms.myapp.service;

import com.hms.myapp.service.dto.RoomDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hms.myapp.domain.Room}.
 */
public interface RoomService {
    /**
     * Save a room.
     *
     * @param roomDTO the entity to save.
     * @return the persisted entity.
     */
    RoomDTO save(RoomDTO roomDTO);

    /**
     * Updates a room.
     *
     * @param roomDTO the entity to update.
     * @return the persisted entity.
     */
    RoomDTO update(RoomDTO roomDTO);

    /**
     * Partially updates a room.
     *
     * @param roomDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<RoomDTO> partialUpdate(RoomDTO roomDTO);

    /**
     * Get all the rooms.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<RoomDTO> findAll(Pageable pageable);

    /**
     * Get the "id" room.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<RoomDTO> findOne(Long id);

    /**
     * Delete the "id" room.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    java.util.List<RoomDTO> findAvailableRooms(
        java.time.LocalDate checkIn,
        java.time.LocalDate checkOut,
        com.hms.myapp.domain.enumeration.RoomType roomType
    );
}
