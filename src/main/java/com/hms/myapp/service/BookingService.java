package com.hms.myapp.service;

import com.hms.myapp.service.dto.BookingDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing {@link com.hms.myapp.domain.Booking}.
 */
public interface BookingService {
    /**
     * Save a booking.
     *
     * @param bookingDTO the entity to save.
     * @return the persisted entity.
     */
    BookingDTO save(BookingDTO bookingDTO);

    /**
     * Updates a booking.
     *
     * @param bookingDTO the entity to update.
     * @return the persisted entity.
     */
    BookingDTO update(BookingDTO bookingDTO);

    /**
     * Partially updates a booking.
     *
     * @param bookingDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<BookingDTO> partialUpdate(BookingDTO bookingDTO);

    /**
     * Get all the bookings.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<BookingDTO> findAll(Pageable pageable);

    /**
     * Get all the bookings with eager load of many-to-many relationships.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<BookingDTO> findAllWithEagerRelationships(Pageable pageable);

    /**
     * Get the "id" booking.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<BookingDTO> findOne(Long id);

    /**
     * Delete the "id" booking.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
