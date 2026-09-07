package com.hms.myapp.service.impl;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.domain.Guest;
import com.hms.myapp.domain.User;
import com.hms.myapp.repository.BookingRepository;
import com.hms.myapp.repository.GuestRepository;
import com.hms.myapp.service.AuditLogService;
import com.hms.myapp.service.BookingNotificationService;
import com.hms.myapp.service.BookingService;
import com.hms.myapp.service.BookingValidationService;
import com.hms.myapp.service.UserService;
import com.hms.myapp.service.dto.BookingDTO;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.service.mapper.BookingMapper;
import com.hms.myapp.service.mapper.GuestMapper;
import com.hms.myapp.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hms.myapp.domain.Booking}.
 */
@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final Logger LOG = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingRepository bookingRepository;

    private final BookingMapper bookingMapper;

    private final BookingValidationService bookingValidationService;

    private final com.hms.myapp.repository.RoomRepository roomRepository;

    private final BookingNotificationService bookingNotificationService;

    private final AuditLogService auditLogService;

    private final GuestRepository guestRepository;

    private final GuestMapper guestMapper;

    private final UserService userService;

    public BookingServiceImpl(
        BookingRepository bookingRepository,
        BookingMapper bookingMapper,
        BookingValidationService bookingValidationService,
        com.hms.myapp.repository.RoomRepository roomRepository,
        BookingNotificationService bookingNotificationService,
        AuditLogService auditLogService,
        GuestRepository guestRepository,
        GuestMapper guestMapper,
        UserService userService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.bookingValidationService = bookingValidationService;
        this.roomRepository = roomRepository;
        this.bookingNotificationService = bookingNotificationService;
        this.auditLogService = auditLogService;
        this.guestRepository = guestRepository;
        this.guestMapper = guestMapper;
        this.userService = userService;
    }

    @Override
    public BookingDTO save(BookingDTO bookingDTO) {
        LOG.debug("Request to save Booking : {}", bookingDTO);
        // Link the guest profile to this booking (creates one if it doesn't exist)
        resolveGuestForBooking(bookingDTO);

        // Ensure the room is actually available for the selected dates
        bookingValidationService.validateNoOverlap(
            bookingDTO.getRoom().getId(),
            bookingDTO.getCheckInDate(),
            bookingDTO.getCheckOutDate(),
            null
        );

        // Check if the initial booking status is valid
        bookingValidationService.assertValidTransition(null, bookingDTO.getStatus());

        // Calculate the total price based on room rate and number of nights
        calculateTotalAmount(bookingDTO);

        if (bookingDTO.getCreatedDate() == null) {
            bookingDTO.setCreatedDate(java.time.Instant.now());
        }

        Booking booking = bookingMapper.toEntity(bookingDTO);
        booking = bookingRepository.save(booking);

        // Always send booking confirmation/receipt email upon creation
        bookingNotificationService.sendBookingConfirmation(booking);

        auditLogService.logAction("Booking", booking.getId(), "CREATE", buildBookingDetails(booking));

        return bookingMapper.toDto(booking);
    }

    @Override
    public BookingDTO update(BookingDTO bookingDTO) {
        LOG.debug("Request to update Booking : {}", bookingDTO);
        resolveGuestForBooking(bookingDTO);
        Booking existing = bookingRepository
            .findById(bookingDTO.getId())
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", "booking", "idnotfound"));

        com.hms.myapp.domain.enumeration.BookingStatus oldStatus = existing.getStatus();

        bookingValidationService.validateNoOverlap(
            bookingDTO.getRoom().getId(),
            bookingDTO.getCheckInDate(),
            bookingDTO.getCheckOutDate(),
            bookingDTO.getId()
        );
        bookingValidationService.assertValidTransition(existing.getStatus(), bookingDTO.getStatus());
        calculateTotalAmount(bookingDTO);

        Booking booking = bookingMapper.toEntity(bookingDTO);
        booking = bookingRepository.save(booking);

        if (
            oldStatus != com.hms.myapp.domain.enumeration.BookingStatus.CONFIRMED &&
            booking.getStatus() == com.hms.myapp.domain.enumeration.BookingStatus.CONFIRMED
        ) {
            bookingNotificationService.sendBookingConfirmation(booking);
        } else if (
            oldStatus != com.hms.myapp.domain.enumeration.BookingStatus.CANCELLED &&
            booking.getStatus() == com.hms.myapp.domain.enumeration.BookingStatus.CANCELLED
        ) {
            bookingNotificationService.sendBookingCancellation(booking);
        }

        auditLogService.logAction("Booking", booking.getId(), "UPDATE", buildBookingDetails(booking));

        return bookingMapper.toDto(booking);
    }

    @Override
    public Optional<BookingDTO> partialUpdate(BookingDTO bookingDTO) {
        LOG.debug("Request to partially update Booking : {}", bookingDTO);

        return bookingRepository
            .findById(bookingDTO.getId())
            .map(existingBooking -> {
                com.hms.myapp.domain.enumeration.BookingStatus oldStatus = existingBooking.getStatus();
                bookingMapper.partialUpdate(existingBooking, bookingDTO);

                bookingValidationService.validateNoOverlap(
                    existingBooking.getRoom().getId(),
                    existingBooking.getCheckInDate(),
                    existingBooking.getCheckOutDate(),
                    existingBooking.getId()
                );
                if (bookingDTO.getStatus() != null) {
                    bookingValidationService.assertValidTransition(oldStatus, existingBooking.getStatus());
                }

                long nights = java.time.temporal.ChronoUnit.DAYS.between(
                    existingBooking.getCheckInDate(),
                    existingBooking.getCheckOutDate()
                );
                java.math.BigDecimal total = existingBooking.getRoom().getPricePerNight().multiply(java.math.BigDecimal.valueOf(nights));
                existingBooking.setTotalAmount(total);

                return existingBooking;
            })
            .map(bookingRepository::save)
            .map(booking -> {
                auditLogService.logAction("Booking", booking.getId(), "UPDATE", buildBookingDetails(booking));
                return bookingMapper.toDto(booking);
            });
    }

    private void calculateTotalAmount(BookingDTO bookingDTO) {
        if (bookingDTO.getRoom() != null && bookingDTO.getRoom().getId() != null) {
            com.hms.myapp.domain.Room room = roomRepository.findById(bookingDTO.getRoom().getId()).orElseThrow();
            long nights = java.time.temporal.ChronoUnit.DAYS.between(bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
            bookingDTO.setTotalAmount(room.getPricePerNight().multiply(java.math.BigDecimal.valueOf(nights)));
        }
    }

    private void resolveGuestForBooking(BookingDTO bookingDTO) {
        // If an email is provided, find the user or register them automatically
        if (bookingDTO.getGuestEmail() != null && !bookingDTO.getGuestEmail().isBlank()) {
            User user = userService.findOrCreateGuestUser(bookingDTO.getGuestEmail(), bookingDTO.getGuestName());
            Guest guest = guestRepository.findOneByUserId(user.getId()).orElseGet(() -> createGuestForUser(bookingDTO, user));
            updateGuestContact(guest, bookingDTO);
            bookingDTO.setGuest(guestMapper.toDto(guest));
            return;
        }

        // Throw an error if we can't identify who is booking
        if (bookingDTO.getGuest() == null || bookingDTO.getGuest().getId() == null) {
            throw new BadRequestAlertException("Guest email or guest profile is required", "booking", "guestrequired");
        }
    }

    private Guest createGuestForUser(BookingDTO bookingDTO, User user) {
        Guest guest = new Guest();
        guest.setUser(user);
        guest.setPhone(resolvePhone(bookingDTO.getGuestPhone()));
        guest.setAddress("");
        guest.setIdDocumentNumber(resolveIdDocument(bookingDTO.getGuestIdDocumentNumber()));
        return guestRepository.save(guest);
    }

    private void updateGuestContact(Guest guest, BookingDTO bookingDTO) {
        boolean changed = false;
        if (
            bookingDTO.getGuestPhone() != null &&
            !bookingDTO.getGuestPhone().isBlank() &&
            !bookingDTO.getGuestPhone().equals(guest.getPhone())
        ) {
            guest.setPhone(bookingDTO.getGuestPhone());
            changed = true;
        }
        if (
            bookingDTO.getGuestIdDocumentNumber() != null &&
            !bookingDTO.getGuestIdDocumentNumber().isBlank() &&
            !bookingDTO.getGuestIdDocumentNumber().equals(guest.getIdDocumentNumber())
        ) {
            guest.setIdDocumentNumber(bookingDTO.getGuestIdDocumentNumber());
            changed = true;
        }
        if (changed) {
            guestRepository.save(guest);
        }
    }

    private String resolvePhone(String phone) {
        return phone == null || phone.isBlank() ? "+94000000000" : phone;
    }

    private String resolveIdDocument(String idDocumentNumber) {
        return idDocumentNumber == null || idDocumentNumber.isBlank() ? "PROFILE-PENDING" : idDocumentNumber;
    }

    private String buildBookingDetails(Booking booking) {
        String room = booking.getRoom() != null ? booking.getRoom().getRoomNumber() : "unknown";
        String guest =
            booking.getGuest() != null && booking.getGuest().getUser() != null ? booking.getGuest().getUser().getLogin() : "unknown";
        return "Booking for " + guest + " in room " + room + " from " + booking.getCheckInDate() + " to " + booking.getCheckOutDate();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Bookings");
        return bookingRepository.findAll(pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDTO> findAllWithEagerRelationships(Pageable pageable) {
        return bookingRepository.findAllWithEagerRelationships(pageable).map(bookingMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BookingDTO> findOne(Long id) {
        LOG.debug("Request to get Booking : {}", id);
        return bookingRepository.findOneWithEagerRelationships(id).map(bookingMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Booking : {}", id);
        bookingRepository.deleteById(id);

        auditLogService.logAction("Booking", id, "DELETE", "Booking was removed");
    }
}
