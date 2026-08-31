package com.hms.myapp.repository;

import com.hms.myapp.domain.Booking;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Booking entity.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    default Optional<Booking> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Booking> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Booking> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select booking from Booking booking left join fetch booking.guest left join fetch booking.room",
        countQuery = "select count(booking) from Booking booking"
    )
    Page<Booking> findAllWithToOneRelationships(Pageable pageable);

    @Query("select booking from Booking booking left join fetch booking.guest left join fetch booking.room")
    List<Booking> findAllWithToOneRelationships();

    @Query("select booking from Booking booking left join fetch booking.guest left join fetch booking.room where booking.id =:id")
    Optional<Booking> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
            SELECT b FROM Booking b
            WHERE b.room.id = :roomId
            AND (:excludeId IS NULL OR b.id <> :excludeId)
            AND b.status IN :activeStatuses
            AND b.checkInDate < :checkOut
            AND b.checkOutDate > :checkIn
        """
    )
    List<Booking> findOverlappingBookings(
        @Param("roomId") Long roomId,
        @Param("checkIn") java.time.LocalDate checkIn,
        @Param("checkOut") java.time.LocalDate checkOut,
        @Param("excludeId") Long excludeId,
        @Param("activeStatuses") List<com.hms.myapp.domain.enumeration.BookingStatus> activeStatuses
    );
}
