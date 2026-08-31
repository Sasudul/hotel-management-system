package com.hms.myapp.repository;

import com.hms.myapp.domain.Room;
import com.hms.myapp.domain.enumeration.RoomType;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Room entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query(
        "SELECT r FROM Room r WHERE " +
            "(:roomType IS NULL OR r.roomType = :roomType) AND " +
            "r.id NOT IN (" +
            "  SELECT b.room.id FROM Booking b " +
            "  WHERE b.status != 'CANCELLED' " +
            "  AND (b.checkInDate < :checkOut AND b.checkOutDate > :checkIn)" +
            ")"
    )
    List<Room> findAvailableRooms(
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("roomType") RoomType roomType
    );
}
