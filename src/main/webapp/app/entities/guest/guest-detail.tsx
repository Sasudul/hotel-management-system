import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router';
import {} from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './guest.reducer';

export const GuestDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id!));
  }, []);

  const guestEntity = useAppSelector(state => state.guest.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="guestDetailsHeading">Guest</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{guestEntity.id}</dd>
          <dt>
            <span id="phone">Phone</span>
          </dt>
          <dd>{guestEntity.phone}</dd>
          <dt>
            <span id="address">Address</span>
          </dt>
          <dd>{guestEntity.address}</dd>
          <dt>
            <span id="idDocumentNumber">Id Document Number</span>
          </dt>
          <dd>{guestEntity.idDocumentNumber}</dd>
          <dt>User</dt>
          <dd>{guestEntity.user ? guestEntity.user.login : ''}</dd>
        </dl>
        <Button as={Link as any} to="/guest" replace variant="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button as={Link as any} to={`/guest/${guestEntity.id}/edit`} replace variant="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default GuestDetail;
