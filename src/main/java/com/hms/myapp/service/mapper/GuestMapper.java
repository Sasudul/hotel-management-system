package com.hms.myapp.service.mapper;

import com.hms.myapp.domain.Guest;
import com.hms.myapp.domain.User;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Guest} and its DTO {@link GuestDTO}.
 */
@Mapper(componentModel = "spring")
public interface GuestMapper extends EntityMapper<GuestDTO, Guest> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userLogin")
    GuestDTO toDto(Guest s);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    @Mapping(target = "email", source = "email")
    UserDTO toDtoUserLogin(User user);
}
