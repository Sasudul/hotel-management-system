import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { TextFormat } from 'react-jhipster';
import { Link, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './booking.reducer';

export const BookingDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id!));
  }, []);

  const bookingEntity = useAppSelector(state => state.booking.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="bookingDetailsHeading">Booking</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{bookingEntity.id}</dd>
          <dt>
            <span id="checkInDate">Check In Date</span>
          </dt>
          <dd>
            {bookingEntity.checkInDate ? <TextFormat value={bookingEntity.checkInDate} type="date" format={APP_LOCAL_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <span id="checkOutDate">Check Out Date</span>
          </dt>
          <dd>
            {bookingEntity.checkOutDate ? (
              <TextFormat value={bookingEntity.checkOutDate} type="date" format={APP_LOCAL_DATE_FORMAT} />
            ) : null}
          </dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{bookingEntity.status}</dd>
          <dt>
            <span id="totalAmount">Total Amount</span>
          </dt>
          <dd>{bookingEntity.totalAmount}</dd>
          <dt>
            <span id="numberOfGuests">Number Of Guests</span>
          </dt>
          <dd>{bookingEntity.numberOfGuests}</dd>
          <dt>
            <span id="specialRequests">Special Requests</span>
          </dt>
          <dd>{bookingEntity.specialRequests}</dd>
          <dt>
            <span id="createdDate">Created Date</span>
          </dt>
          <dd>
            {bookingEntity.createdDate ? <TextFormat value={bookingEntity.createdDate} type="date" format={APP_DATE_FORMAT} /> : null}
          </dd>
          <dt>
            <span id="cancelledReason">Cancelled Reason</span>
          </dt>
          <dd>{bookingEntity.cancelledReason}</dd>
          <dt>Guest</dt>
          <dd>{bookingEntity.guest ? bookingEntity.guest.idDocumentNumber : ''}</dd>
          <dt>Room</dt>
          <dd>{bookingEntity.room ? bookingEntity.room.roomNumber : ''}</dd>
        </dl>
        <Button as={Link as any} to="/booking" replace variant="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button as={Link as any} to={`/booking/${bookingEntity.id}/edit`} replace variant="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default BookingDetail;
