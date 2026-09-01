package com.hms.myapp.service;

import com.hms.myapp.domain.Booking;
import com.hms.myapp.domain.Guest;
import com.hms.myapp.domain.User;
import com.hms.myapp.repository.GuestRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class BookingNotificationService {

    private final Logger log = LoggerFactory.getLogger(BookingNotificationService.class);

    private final JavaMailSender javaMailSender;
    private final GuestRepository guestRepository;

    public BookingNotificationService(JavaMailSender javaMailSender, GuestRepository guestRepository) {
        this.javaMailSender = javaMailSender;
        this.guestRepository = guestRepository;
    }

    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (booking.getGuest() == null || booking.getGuest().getId() == null) {
            return;
        }

        Guest guest = guestRepository.findOneWithEagerRelationships(booking.getGuest().getId()).orElse(null);
        if (guest == null || guest.getUser() == null || guest.getUser().getEmail() == null) {
            log.warn("Cannot send email, guest or email is missing for booking {}", booking.getId());
            return;
        }

        User user = guest.getUser();
        String to = user.getEmail();
        String subject = "Your Grand Hotel Sri Lanka booking is confirmed";
        String content = String.format(
            "<html><body>" +
                "<h2>Hello %s,</h2>" +
                "<p>Your booking <strong>#BK-%d</strong> has been confirmed.</p>" +
                "<p>Check-in: %s</p>" +
                "<p>Check-out: %s</p>" +
                "<p>Total Amount: LKR %s</p>" +
                "<br><p>Thank you for choosing Grand Hotel Sri Lanka.</p>" +
                "</body></html>",
            user.getFirstName() == null ? user.getLogin() : user.getFirstName(),
            booking.getId(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getTotalAmount()
        );

        sendEmail(to, subject, content);
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        if (booking.getGuest() == null || booking.getGuest().getId() == null) {
            return;
        }

        Guest guest = guestRepository.findOneWithEagerRelationships(booking.getGuest().getId()).orElse(null);
        if (guest == null || guest.getUser() == null || guest.getUser().getEmail() == null) {
            log.warn("Cannot send email, guest or email is missing for booking {}", booking.getId());
            return;
        }

        User user = guest.getUser();
        String to = user.getEmail();
        String subject = "Booking Cancellation - HotelMS";
        String content = String.format(
            "<html><body>" +
                "<h2>Hello %s,</h2>" +
                "<p>Your booking (ID: %d) has been cancelled.</p>" +
                "<p>Reason: %s</p>" +
                "<br><p>We hope to see you again.</p>" +
                "</body></html>",
            user.getFirstName() == null ? user.getLogin() : user.getFirstName(),
            booking.getId(),
            booking.getCancelledReason()
        );

        sendEmail(to, subject, content);
    }

    private void sendEmail(String to, String subject, String content) {
        log.debug("Send email to '{}' with subject '{}'", to, subject);

        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper message = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());
            message.setTo(to);
            message.setFrom("no-reply@hotelms.com");
            message.setSubject(subject);
            message.setText(content, true);

            log.info(
                "\n----------------------------------------------------\n" +
                    "Booking notification email:\n" +
                    "To: {}\nSubject: {}\nContent:\n{}\n" +
                    "----------------------------------------------------",
                to,
                subject,
                content
            );

            javaMailSender.send(mimeMessage);
            log.debug("Sent email to User '{}'", to);
        } catch (MailException | MessagingException e) {
            log.warn("Email could not be sent to user '{}' because no SMTP server is configured (Connection refused).", to);
        }
    }
}
