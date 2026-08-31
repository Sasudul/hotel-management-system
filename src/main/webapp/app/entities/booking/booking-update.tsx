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
      guest: guests.find(it => it.id.toString() === values.guest?.toString()),
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
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="hotelManagementSystemApp.booking.home.createOrEditLabel" data-cy="BookingCreateUpdateHeading">
            Create or edit a Booking
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew && <ValidatedField name="id" required readOnly id="booking-id" label="ID" validate={{ required: true }} />}
              <ValidatedField
                label="Check In Date"
                id="booking-checkInDate"
                name="checkInDate"
                data-cy="checkInDate"
                type="date"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Check Out Date"
                id="booking-checkOutDate"
                name="checkOutDate"
                data-cy="checkOutDate"
                type="date"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField label="Status" id="booking-status" name="status" data-cy="status" type="select">
                {bookingStatusValues.map(bookingStatus => (
                  <option value={bookingStatus} key={bookingStatus}>
                    {bookingStatus}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label="Total Amount"
                id="booking-totalAmount"
                name="totalAmount"
                data-cy="totalAmount"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  min: { value: 0, message: 'This field should be at least 0.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Number Of Guests"
                id="booking-numberOfGuests"
                name="numberOfGuests"
                data-cy="numberOfGuests"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  min: { value: 1, message: 'This field should be at least 1.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField
                label="Special Requests"
                id="booking-specialRequests"
                name="specialRequests"
                data-cy="specialRequests"
                type="text"
                validate={{
                  maxLength: { value: 1000, message: 'This field cannot be longer than 1000 characters.' },
                }}
              />
              <ValidatedField
                label="Created Date"
                id="booking-createdDate"
                name="createdDate"
                data-cy="createdDate"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                }}
              />
              <ValidatedField
                label="Cancelled Reason"
                id="booking-cancelledReason"
                name="cancelledReason"
                data-cy="cancelledReason"
                type="text"
                validate={{
                  maxLength: { value: 500, message: 'This field cannot be longer than 500 characters.' },
                }}
              />
              <ValidatedField id="booking-guest" name="guest" data-cy="guest" label="Guest" type="select" required>
                <option value="" key="0" />
                {guests
                  ? guests.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.idDocumentNumber}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <FormText>This field is required.</FormText>
              <ValidatedField id="booking-room" name="room" data-cy="room" label="Room" type="select" required>
                <option value="" key="0" />
                {rooms
                  ? rooms.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.roomNumber}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <FormText>This field is required.</FormText>
              <Button as={Link as any} id="cancel-save" data-cy="entityCreateCancelButton" to="/booking" replace variant="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">Back</span>
              </Button>
              &nbsp;
              <Button variant="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp; Save
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default BookingUpdate;
