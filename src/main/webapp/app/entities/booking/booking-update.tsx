import React, { useEffect } from 'react';
import { Button, Col, FormText, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { Link, useNavigate, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getGuests } from 'app/entities/guest/guest.reducer';
import { getEntities as getRooms } from 'app/entities/room/room.reducer';
import { BookingStatus } from 'app/shared/model/enumerations/booking-status.model';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';

import { createEntity, getEntity, reset, updateEntity } from './booking.reducer';

export const BookingUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const guests = useAppSelector(state => state.guest.entities);
  const rooms = useAppSelector(state => state.room.entities);
  const bookingEntity = useAppSelector(state => state.booking.entity);
  const loading = useAppSelector(state => state.booking.loading);
  const updating = useAppSelector(state => state.booking.updating);
  const updateSuccess = useAppSelector(state => state.booking.updateSuccess);
  const bookingStatusValues = Object.keys(BookingStatus);

  const handleClose = () => {
    navigate(`/booking${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getGuests({}));
    dispatch(getRooms({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }
    if (values.totalAmount !== undefined && typeof values.totalAmount !== 'number') {
      values.totalAmount = Number(values.totalAmount);
    }
    if (values.numberOfGuests !== undefined && typeof values.numberOfGuests !== 'number') {
      values.numberOfGuests = Number(values.numberOfGuests);
    }
    values.createdDate = convertDateTimeToServer(values.createdDate);

    const entity = {
      ...bookingEntity,
      ...values,
      guest: values.guestEmail ? undefined : guests.find(it => it.id.toString() === values.guest?.toString()),
      room: rooms.find(it => it.id.toString() === values.room?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          createdDate: displayDefaultDateTime(),
        }
      : {
          status: 'PENDING',
          ...bookingEntity,
          createdDate: convertDateTimeFromServer(bookingEntity.createdDate),
          guest: bookingEntity?.guest?.id,
          room: bookingEntity?.room?.id,
        };

  return (
    <div className="hms-edit-page">
      <Row className="justify-content-center">
        <Col xl="9" lg="10">
          <div className="hms-form-title">
            <div>
              <span className="hms-eyebrow">Reservations</span>
              <h2 id="hotelManagementSystemApp.booking.home.createOrEditLabel" data-cy="BookingCreateUpdateHeading">
                {isNew ? 'Create Booking' : 'Edit Booking'}
              </h2>
            </div>
            <span className="hms-title-pill">Email confirmation enabled</span>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xl="9" lg="10">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm className="hms-entity-form" defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew && <ValidatedField name="id" required readOnly id="booking-id" label="ID" validate={{ required: true }} />}
              <div className="hms-form-section">
                <h3>Stay Details</h3>
                <div className="hms-form-grid">
                  <ValidatedField label="Room" id="booking-room" name="room" data-cy="room" type="select" required>
                    <option value="" key="0">
                      Choose a room
                    </option>
                    {rooms?.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        Room {otherEntity.roomNumber}
                      </option>
                    ))}
                  </ValidatedField>
                  <ValidatedField label="Status" id="booking-status" name="status" data-cy="status" type="select">
                    {bookingStatusValues.map(bookingStatus => (
                      <option value={bookingStatus} key={bookingStatus}>
                        {bookingStatus}
                      </option>
                    ))}
                  </ValidatedField>
                  <ValidatedField
                    label="Check-in Date"
                    id="booking-checkInDate"
                    name="checkInDate"
                    data-cy="checkInDate"
                    type="date"
                    validate={{ required: { value: true, message: 'This field is required.' } }}
                  />
                  <ValidatedField
                    label="Check-out Date"
                    id="booking-checkOutDate"
                    name="checkOutDate"
                    data-cy="checkOutDate"
                    type="date"
                    validate={{ required: { value: true, message: 'This field is required.' } }}
                  />
                  <ValidatedField
                    label="Guests"
                    id="booking-numberOfGuests"
                    name="numberOfGuests"
                    data-cy="numberOfGuests"
                    type="number"
                    validate={{
                      required: { value: true, message: 'This field is required.' },
                      min: { value: 1, message: 'This field should be at least 1.' },
                      validate: v => isNumber(v) || 'This field should be a number.',
                    }}
                  />
                  <ValidatedField
                    label="Total Amount (LKR)"
                    id="booking-totalAmount"
                    name="totalAmount"
                    data-cy="totalAmount"
                    type="number"
                    validate={{
                      required: { value: true, message: 'This field is required.' },
                      min: { value: 0, message: 'This field should be at least 0.' },
                      validate: v => isNumber(v) || 'This field should be a number.',
                    }}
                  />
                </div>
              </div>
              <div className="hms-form-section">
                <h3>Guest Profile</h3>
                <div className="hms-form-grid">
                  <ValidatedField
                    label="Guest Gmail / Email"
                    id="booking-guestEmail"
                    name="guestEmail"
                    data-cy="guestEmail"
                    type="email"
                    placeholder="guest@gmail.com"
                  />
                  <ValidatedField label="Guest Name" id="booking-guestName" name="guestName" data-cy="guestName" type="text" />
                  <ValidatedField label="Guest Phone" id="booking-guestPhone" name="guestPhone" data-cy="guestPhone" type="text" />
                  <ValidatedField
                    label="ID Card / Passport Number"
                    id="booking-guestIdDocumentNumber"
                    name="guestIdDocumentNumber"
                    data-cy="guestIdDocumentNumber"
                    type="text"
                  />
                  <ValidatedField id="booking-guest" name="guest" data-cy="guest" label="Existing Guest" type="select">
                    <option value="" key="0">
                      Select only when email is not used
                    </option>
                    {guests?.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.user?.email || otherEntity.user?.login || otherEntity.idDocumentNumber}
                      </option>
                    ))}
                  </ValidatedField>
                  <FormText>Entering an email will find or create the guest account automatically.</FormText>
                </div>
              </div>
              <div className="hms-form-section">
                <h3>Notes</h3>
                <ValidatedField
                  label="Special Requests"
                  id="booking-specialRequests"
                  name="specialRequests"
                  data-cy="specialRequests"
                  type="textarea"
                  validate={{ maxLength: { value: 1000, message: 'This field cannot be longer than 1000 characters.' } }}
                />
                <div className="hms-form-grid">
                  <ValidatedField
                    label="Created Date"
                    id="booking-createdDate"
                    name="createdDate"
                    data-cy="createdDate"
                    type="datetime-local"
                    placeholder="YYYY-MM-DD HH:mm"
                    validate={{ required: { value: true, message: 'This field is required.' } }}
                  />
                  <ValidatedField
                    label="Cancelled Reason"
                    id="booking-cancelledReason"
                    name="cancelledReason"
                    data-cy="cancelledReason"
                    type="text"
                    validate={{ maxLength: { value: 500, message: 'This field cannot be longer than 500 characters.' } }}
                  />
                </div>
              </div>
              <div className="hms-form-actions">
                <Button as={Link as any} id="cancel-save" data-cy="entityCreateCancelButton" to="/booking" replace variant="info">
                  <FontAwesomeIcon icon="arrow-left" />
                  <span>Back</span>
                </Button>
                <Button variant="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                  <FontAwesomeIcon icon="save" />
                  <span>{updating ? 'Saving...' : 'Save Booking'}</span>
                </Button>
              </div>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BookingUpdate;
