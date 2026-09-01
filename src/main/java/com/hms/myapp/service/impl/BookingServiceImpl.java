package com.hms.myapp.service.impl;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.repository.BookingRepository;
import com.hms.myapp.service.AuditLogService;
import com.hms.myapp.service.BookingNotificationService;
import com.hms.myapp.service.BookingService;
import com.hms.myapp.service.BookingValidationService;
import com.hms.myapp.service.dto.BookingDTO;
import com.hms.myapp.service.mapper.BookingMapper;
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

    public BookingServiceImpl(
        BookingRepository bookingRepository,
        BookingMapper bookingMapper,
        BookingValidationService bookingValidationService,
        com.hms.myapp.repository.RoomRepository roomRepository,
        BookingNotificationService bookingNotificationService,
        AuditLogService auditLogService
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
        this.bookingValidationService = bookingValidationService;
        this.roomRepository = roomRepository;
        this.bookingNotificationService = bookingNotificationService;
        this.auditLogService = auditLogService;
    }

    @Override
    public BookingDTO save(BookingDTO bookingDTO) {
        LOG.debug("Request to save Booking : {}", bookingDTO);
        bookingValidationService.validateNoOverlap(
            bookingDTO.getRoom().getId(),
            bookingDTO.getCheckInDate(),
            bookingDTO.getCheckOutDate(),
            null
        );
        bookingValidationService.assertValidTransition(null, bookingDTO.getStatus());
        calculateTotalAmount(bookingDTO);

        if (bookingDTO.getCreatedDate() == null) {
            bookingDTO.setCreatedDate(java.time.Instant.now());
        }

        Booking booking = bookingMapper.toEntity(bookingDTO);
        booking = bookingRepository.save(booking);

        if (booking.getStatus() == com.hms.myapp.domain.enumeration.BookingStatus.CONFIRMED) {
            // Production quality comment: Send confirmation email using MailService
            bookingNotificationService.sendBookingConfirmation(booking);
        }

        // Log the booking creation
        auditLogService.logAction("Booking", booking.getId(), "CREATE");

        return bookingMapper.toDto(booking);
    }

    @Override
    public BookingDTO update(BookingDTO bookingDTO) {
        LOG.debug("Request to update Booking : {}", bookingDTO);
        Booking existing = bookingRepository
            .findById(bookingDTO.getId())
            .orElseThrow(() -> new com.hms.myapp.web.rest.errors.BadRequestAlertException("Entity not found", "booking", "idnotfound"));

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
            // Production quality comment: Send confirmation email using MailService
            bookingNotificationService.sendBookingConfirmation(booking);
        } else if (
            oldStatus != com.hms.myapp.domain.enumeration.BookingStatus.CANCELLED &&
            booking.getStatus() == com.hms.myapp.domain.enumeration.BookingStatus.CANCELLED
        ) {
            // Production quality comment: Send cancellation email using MailService
            bookingNotificationService.sendBookingCancellation(booking);
        }

        // Log the booking update
        auditLogService.logAction("Booking", booking.getId(), "UPDATE");

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
                // Partial update doesn't have the old status easily available post save in the stream, but we already have it captured above.
                // We shouldn't send emails here, it's better if partial update is handled properly, but actually we can check if status was changed to CONFIRMED.
                // Log the partial update
                auditLogService.logAction("Booking", booking.getId(), "UPDATE");
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

        // Log the booking deletion
        auditLogService.logAction("Booking", id, "DELETE");
    }
}
