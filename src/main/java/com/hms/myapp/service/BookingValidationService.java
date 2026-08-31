package com.hms.myapp.service;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.domain.enumeration.BookingStatus;
import com.hms.myapp.repository.BookingRepository;
import com.hms.myapp.web.rest.errors.BadRequestAlertException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BookingValidationService {

    private final BookingRepository bookingRepository;

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED_TRANSITIONS = Map.of(
        BookingStatus.PENDING,
        Set.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED),
        BookingStatus.CONFIRMED,
        Set.of(BookingStatus.CHECKED_IN, BookingStatus.CANCELLED),
        BookingStatus.CHECKED_IN,
        Set.of(BookingStatus.CHECKED_OUT),
        BookingStatus.CHECKED_OUT,
        Set.of(),
        BookingStatus.CANCELLED,
        Set.of()
    );

    public BookingValidationService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public void validateNoOverlap(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeBookingId) {
        if (checkIn == null || checkOut == null) {
            throw new BadRequestAlertException("Check-in and check-out dates are required", "booking", "missingdates");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new BadRequestAlertException("Check-out must be after check-in", "booking", "invaliddates");
        }

        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
            roomId,
            checkIn,
            checkOut,
            excludeBookingId,
            List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN)
        );

        if (!overlapping.isEmpty()) {
            throw new BadRequestAlertException("Room is not available for the selected dates", "booking", "roomunavailable");
        }
    }

    public void assertValidTransition(BookingStatus from, BookingStatus to) {
        if (from == to) {
            return;
        }
        if (from == null) {
            from = BookingStatus.PENDING; // For new bookings
        }
        if (!ALLOWED_TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
            throw new BadRequestAlertException("Cannot transition booking from " + from + " to " + to, "booking", "invalidtransition");
        }
    }
}
