package com.hms.myapp.service.mapper;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.domain.Guest;
import com.hms.myapp.domain.Room;
import com.hms.myapp.service.dto.BookingDTO;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.service.dto.RoomDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Booking} and its DTO {@link BookingDTO}.
 */
@Mapper(componentModel = "spring")
public interface BookingMapper extends EntityMapper<BookingDTO, Booking> {
    @Mapping(target = "guest", source = "guest", qualifiedByName = "guestIdDocumentNumber")
    @Mapping(target = "room", source = "room", qualifiedByName = "roomRoomNumber")
    BookingDTO toDto(Booking s);

    @Named("guestIdDocumentNumber")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "idDocumentNumber", source = "idDocumentNumber")
    @Mapping(target = "phone", source = "phone")
    @Mapping(target = "user", source = "user")
    GuestDTO toDtoGuestIdDocumentNumber(Guest guest);

    @Named("roomRoomNumber")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "roomNumber", source = "roomNumber")
    RoomDTO toDtoRoomRoomNumber(Room room);
}
