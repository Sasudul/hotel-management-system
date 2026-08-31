package com.hms.myapp.service.mapper;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.domain.Payment;
import com.hms.myapp.domain.User;
import com.hms.myapp.service.dto.BookingDTO;
import com.hms.myapp.service.dto.PaymentDTO;
import com.hms.myapp.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Payment} and its DTO {@link PaymentDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaymentMapper extends EntityMapper<PaymentDTO, Payment> {
    @Mapping(target = "booking", source = "booking", qualifiedByName = "bookingId")
    @Mapping(target = "recordedBy", source = "recordedBy", qualifiedByName = "userLogin")
    PaymentDTO toDto(Payment s);

    @Named("bookingId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    BookingDTO toDtoBookingId(Booking booking);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
