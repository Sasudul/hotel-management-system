package com.hms.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class GuestTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static Guest getGuestSample1() {
        return new Guest().id(1L).phone("phone1").address("address1").idDocumentNumber("idDocumentNumber1");
    }

    public static Guest getGuestSample2() {
        return new Guest().id(2L).phone("phone2").address("address2").idDocumentNumber("idDocumentNumber2");
    }

    public static Guest getGuestRandomSampleGenerator() {
        return new Guest()
            .id(longCount.incrementAndGet())
            .phone(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .idDocumentNumber(UUID.randomUUID().toString());
    }
}
