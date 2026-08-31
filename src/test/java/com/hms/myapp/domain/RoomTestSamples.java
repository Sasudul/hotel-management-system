package com.hms.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class RoomTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static Room getRoomSample1() {
        return new Room().id(1L).roomNumber("roomNumber1").capacity(1).description("description1").amenities("amenities1");
    }

    public static Room getRoomSample2() {
        return new Room().id(2L).roomNumber("roomNumber2").capacity(2).description("description2").amenities("amenities2");
    }

    public static Room getRoomRandomSampleGenerator() {
        return new Room()
            .id(longCount.incrementAndGet())
            .roomNumber(UUID.randomUUID().toString())
            .capacity(intCount.incrementAndGet())
            .description(UUID.randomUUID().toString())
            .amenities(UUID.randomUUID().toString());
    }
}
