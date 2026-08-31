package com.hms.myapp.service.dto;

import com.hms.myapp.domain.enumeration.RoomStatus;
import com.hms.myapp.domain.enumeration.RoomType;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.hms.myapp.domain.Room} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RoomDTO implements Serializable {

    private Long id;

    @NotNull
    private String roomNumber;

    @NotNull
    private RoomType roomType;

    @NotNull
    @DecimalMin(value = "0")
    private BigDecimal pricePerNight;

    @NotNull
    @Min(value = 1)
    private Integer capacity;

    @NotNull
    private RoomStatus status;

    @Size(max = 1000)
    private String description;

    @Size(max = 500)
    private String amenities;

    // A simple single-line comment for production quality: Image URL for the room
    @Size(max = 1000)
    private String imageUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RoomDTO)) {
            return false;
        }

        RoomDTO roomDTO = (RoomDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, roomDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RoomDTO{" +
            "id=" + getId() +
            ", roomNumber='" + getRoomNumber() + "'" +
            ", roomType='" + getRoomType() + "'" +
            ", pricePerNight=" + getPricePerNight() +
            ", capacity=" + getCapacity() +
            ", status='" + getStatus() + "'" +
            ", description='" + getDescription() + "'" +
            ", amenities='" + getAmenities() + "'" +
            ", imageUrl='" + getImageUrl() + "'" +
            "}";
    }
}
