package com.hms.myapp.domain;

import static com.hms.myapp.domain.BookingTestSamples.*;
import static com.hms.myapp.domain.GuestTestSamples.*;
import static com.hms.myapp.domain.RoomTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.hms.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class BookingTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Booking.class);
        Booking booking1 = getBookingSample1();
        Booking booking2 = new Booking();
        assertThat(booking1).isNotEqualTo(booking2);

        booking2.setId(booking1.getId());
        assertThat(booking1).isEqualTo(booking2);

        booking2 = getBookingSample2();
        assertThat(booking1).isNotEqualTo(booking2);
    }

    @Test
    void guestTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Guest guestBack = getGuestRandomSampleGenerator();

        booking.setGuest(guestBack);
        assertThat(booking.getGuest()).isEqualTo(guestBack);

        booking.guest(null);
        assertThat(booking.getGuest()).isNull();
    }

    @Test
    void roomTest() {
        Booking booking = getBookingRandomSampleGenerator();
        Room roomBack = getRoomRandomSampleGenerator();

        booking.setRoom(roomBack);
        assertThat(booking.getRoom()).isEqualTo(roomBack);

        booking.room(null);
        assertThat(booking.getRoom()).isNull();
    }
}
