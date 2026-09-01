package com.hms.myapp.service.impl;

import com.hms.myapp.domain.Payment;
import com.hms.myapp.repository.PaymentRepository;
import com.hms.myapp.service.AuditLogService;
import com.hms.myapp.service.PaymentService;
import com.hms.myapp.service.dto.PaymentDTO;
import com.hms.myapp.service.mapper.PaymentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hms.myapp.domain.Payment}.
 */
@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger LOG = LoggerFactory.getLogger(PaymentServiceImpl.class);

    private final PaymentRepository paymentRepository;

    private final PaymentMapper paymentMapper;

    private final AuditLogService auditLogService;

    public PaymentServiceImpl(PaymentRepository paymentRepository, PaymentMapper paymentMapper, AuditLogService auditLogService) {
        this.paymentRepository = paymentRepository;
        this.paymentMapper = paymentMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    public PaymentDTO save(PaymentDTO paymentDTO) {
        LOG.debug("Request to save Payment : {}", paymentDTO);
        Payment payment = paymentMapper.toEntity(paymentDTO);
        payment = paymentRepository.save(payment);
        auditLogService.logAction("Payment", payment.getId(), "CREATE", buildPaymentDetails(payment));
        return paymentMapper.toDto(payment);
    }

    @Override
    public PaymentDTO update(PaymentDTO paymentDTO) {
        LOG.debug("Request to update Payment : {}", paymentDTO);
        Payment payment = paymentMapper.toEntity(paymentDTO);
        payment = paymentRepository.save(payment);
        auditLogService.logAction("Payment", payment.getId(), "UPDATE", buildPaymentDetails(payment));
        return paymentMapper.toDto(payment);
    }

    @Override
    public Optional<PaymentDTO> partialUpdate(PaymentDTO paymentDTO) {
        LOG.debug("Request to partially update Payment : {}", paymentDTO);

        return paymentRepository
            .findById(paymentDTO.getId())
            .map(existingPayment -> {
                paymentMapper.partialUpdate(existingPayment, paymentDTO);

                return existingPayment;
            })
            .map(paymentRepository::save)
            .map(payment -> {
                auditLogService.logAction("Payment", payment.getId(), "UPDATE", buildPaymentDetails(payment));
                return paymentMapper.toDto(payment);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Payments");
        return paymentRepository.findAll(pageable).map(paymentMapper::toDto);
    }

    public Page<PaymentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return paymentRepository.findAllWithEagerRelationships(pageable).map(paymentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentDTO> findOne(Long id) {
        LOG.debug("Request to get Payment : {}", id);
        return paymentRepository.findOneWithEagerRelationships(id).map(paymentMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Payment : {}", id);
        paymentRepository.deleteById(id);
        auditLogService.logAction("Payment", id, "DELETE", "Payment was removed");
    }

    private String buildPaymentDetails(Payment payment) {
        Long bookingId = payment.getBooking() != null ? payment.getBooking().getId() : null;
        return "Payment " + payment.getStatus() + " for booking #" + bookingId + " amount LKR " + payment.getAmount();
    }
}
