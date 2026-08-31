import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './room.reducer';

export const RoomDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id!));
  }, []);

  const roomEntity = useAppSelector(state => state.room.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="roomDetailsHeading">Room</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{roomEntity.id}</dd>
          <dt>
            <span id="roomNumber">Room Number</span>
          </dt>
          <dd>{roomEntity.roomNumber}</dd>
          <dt>
            <span id="roomType">Room Type</span>
          </dt>
          <dd>{roomEntity.roomType}</dd>
          <dt>
            <span id="pricePerNight">Price Per Night</span>
          </dt>
          <dd>{roomEntity.pricePerNight}</dd>
          <dt>
            <span id="capacity">Capacity</span>
          </dt>
          <dd>{roomEntity.capacity}</dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{roomEntity.status}</dd>
          <dt>
            <span id="description">Description</span>
          </dt>
          <dd>{roomEntity.description}</dd>
          <dt>
            <span id="amenities">Amenities</span>
          </dt>
          <dd>{roomEntity.amenities}</dd>
        </dl>
        <Button as={Link as any} to="/room" replace variant="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button as={Link as any} to={`/room/${roomEntity.id}/edit`} replace variant="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default RoomDetail;
