package com.hms.myapp.service.impl;

import com.hms.myapp.domain.Guest;
import com.hms.myapp.repository.GuestRepository;
import com.hms.myapp.service.GuestService;
import com.hms.myapp.service.dto.GuestDTO;
import com.hms.myapp.service.mapper.GuestMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hms.myapp.domain.Guest}.
 */
@Service
@Transactional
public class GuestServiceImpl implements GuestService {

    private static final Logger LOG = LoggerFactory.getLogger(GuestServiceImpl.class);

    private final GuestRepository guestRepository;

    private final GuestMapper guestMapper;

    public GuestServiceImpl(GuestRepository guestRepository, GuestMapper guestMapper) {
        this.guestRepository = guestRepository;
        this.guestMapper = guestMapper;
    }

    @Override
    public GuestDTO save(GuestDTO guestDTO) {
        LOG.debug("Request to save Guest : {}", guestDTO);
        Guest guest = guestMapper.toEntity(guestDTO);
        guest = guestRepository.save(guest);
        return guestMapper.toDto(guest);
    }

    @Override
    public GuestDTO update(GuestDTO guestDTO) {
        LOG.debug("Request to update Guest : {}", guestDTO);
        Guest guest = guestMapper.toEntity(guestDTO);
        guest = guestRepository.save(guest);
        return guestMapper.toDto(guest);
    }

    @Override
    public Optional<GuestDTO> partialUpdate(GuestDTO guestDTO) {
        LOG.debug("Request to partially update Guest : {}", guestDTO);

        return guestRepository
            .findById(guestDTO.getId())
            .map(existingGuest -> {
                guestMapper.partialUpdate(existingGuest, guestDTO);

                return existingGuest;
            })
            .map(guestRepository::save)
            .map(guestMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestDTO> findAll() {
        LOG.debug("Request to get all Guests");
        return guestRepository.findAll().stream().map(guestMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    public Page<GuestDTO> findAllWithEagerRelationships(Pageable pageable) {
        return guestRepository.findAllWithEagerRelationships(pageable).map(guestMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GuestDTO> findOne(Long id) {
        LOG.debug("Request to get Guest : {}", id);
        return guestRepository.findOneWithEagerRelationships(id).map(guestMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Guest : {}", id);
        guestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GuestDTO> findByUserLogin(String login) {
        LOG.debug("Request to get Guest by user login : {}", login);
        List<Guest> guests = guestRepository.findByUserLogin(login);
        if (guests != null && !guests.isEmpty()) {
            return Optional.of(guestMapper.toDto(guests.get(0)));
        }
        return Optional.empty();
    }
}
