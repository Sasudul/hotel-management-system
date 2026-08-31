package com.hms.myapp.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.hms.myapp.domain.Guest} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class GuestDTO implements Serializable {

    private Long id;

    @NotNull
    @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$")
    private String phone;

    @Size(max = 500)
    private String address;

    @NotNull
    private String idDocumentNumber;

    @NotNull
    private UserDTO user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getIdDocumentNumber() {
        return idDocumentNumber;
    }

    public void setIdDocumentNumber(String idDocumentNumber) {
        this.idDocumentNumber = idDocumentNumber;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof GuestDTO)) {
            return false;
        }

        GuestDTO guestDTO = (GuestDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, guestDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "GuestDTO{" +
            "id=" + getId() +
            ", phone='" + getPhone() + "'" +
            ", address='" + getAddress() + "'" +
            ", idDocumentNumber='" + getIdDocumentNumber() + "'" +
            ", user=" + getUser() +
            "}";
    }
}
