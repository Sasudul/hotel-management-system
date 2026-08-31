package com.hms.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class BookingTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static Booking getBookingSample1() {
        return new Booking().id(1L).numberOfGuests(1).specialRequests("specialRequests1").cancelledReason("cancelledReason1");
    }

    public static Booking getBookingSample2() {
        return new Booking().id(2L).numberOfGuests(2).specialRequests("specialRequests2").cancelledReason("cancelledReason2");
    }

    public static Booking getBookingRandomSampleGenerator() {
        return new Booking()
            .id(longCount.incrementAndGet())
            .numberOfGuests(intCount.incrementAndGet())
            .specialRequests(UUID.randomUUID().toString())
            .cancelledReason(UUID.randomUUID().toString());
    }
}
