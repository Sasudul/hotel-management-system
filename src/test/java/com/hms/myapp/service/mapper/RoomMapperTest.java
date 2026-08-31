package com.hms.myapp.service.mapper;

import static com.hms.myapp.domain.RoomAsserts.*;
import static com.hms.myapp.domain.RoomTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RoomMapperTest {

    private RoomMapper roomMapper;

    @BeforeEach
    void setUp() {
        roomMapper = new RoomMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRoomSample1();
        var actual = roomMapper.toEntity(roomMapper.toDto(expected));
        assertRoomAllPropertiesEquals(expected, actual);
    }
}
