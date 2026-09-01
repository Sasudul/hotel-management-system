package com.hms.myapp.service.impl;

import com.hms.myapp.domain.Room;
import com.hms.myapp.repository.RoomRepository;
import com.hms.myapp.service.AuditLogService;
import com.hms.myapp.service.RoomService;
import com.hms.myapp.service.dto.RoomDTO;
import com.hms.myapp.service.mapper.RoomMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.hms.myapp.domain.Room}.
 */
@Service
@Transactional
public class RoomServiceImpl implements RoomService {

    private static final Logger LOG = LoggerFactory.getLogger(RoomServiceImpl.class);

    private final RoomRepository roomRepository;

    private final RoomMapper roomMapper;

    private final AuditLogService auditLogService;

    public RoomServiceImpl(RoomRepository roomRepository, RoomMapper roomMapper, AuditLogService auditLogService) {
        this.roomRepository = roomRepository;
        this.roomMapper = roomMapper;
        this.auditLogService = auditLogService;
    }

    @Override
    public RoomDTO save(RoomDTO roomDTO) {
        LOG.debug("Request to save Room : {}", roomDTO);
        Room room = roomMapper.toEntity(roomDTO);
        room = roomRepository.save(room);

        auditLogService.logAction("Room", room.getId(), "CREATE", buildRoomDetails(room));

        return roomMapper.toDto(room);
    }

    @Override
    public RoomDTO update(RoomDTO roomDTO) {
        LOG.debug("Request to update Room : {}", roomDTO);
        Room room = roomMapper.toEntity(roomDTO);
        room = roomRepository.save(room);

        auditLogService.logAction("Room", room.getId(), "UPDATE", buildRoomDetails(room));

        return roomMapper.toDto(room);
    }

    @Override
    public Optional<RoomDTO> partialUpdate(RoomDTO roomDTO) {
        LOG.debug("Request to partially update Room : {}", roomDTO);

        return roomRepository
            .findById(roomDTO.getId())
            .map(existingRoom -> {
                roomMapper.partialUpdate(existingRoom, roomDTO);

                return existingRoom;
            })
            .map(roomRepository::save)
            .map(room -> {
                auditLogService.logAction("Room", room.getId(), "UPDATE", buildRoomDetails(room));
                return roomMapper.toDto(room);
            });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Rooms");
        return roomRepository.findAll(pageable).map(roomMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RoomDTO> findOne(Long id) {
        LOG.debug("Request to get Room : {}", id);
        return roomRepository.findById(id).map(roomMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Room : {}", id);
        roomRepository.deleteById(id);

        auditLogService.logAction("Room", id, "DELETE", "Room was removed");
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<RoomDTO> findAvailableRooms(
        java.time.LocalDate checkIn,
        java.time.LocalDate checkOut,
        com.hms.myapp.domain.enumeration.RoomType roomType
    ) {
        LOG.debug("Request to find available rooms from {} to {} for type {}", checkIn, checkOut, roomType);
        return roomRepository
            .findAvailableRooms(checkIn, checkOut, roomType)
            .stream()
            .map(roomMapper::toDto)
            .collect(java.util.stream.Collectors.toList());
    }

    private String buildRoomDetails(Room room) {
        return "Room " + room.getRoomNumber() + " is " + room.getStatus() + " at LKR " + room.getPricePerNight() + " per night";
    }
}
