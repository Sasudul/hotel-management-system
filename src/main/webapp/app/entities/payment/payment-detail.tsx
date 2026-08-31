import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { TextFormat } from 'react-jhipster';
import { Link, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './payment.reducer';

export const PaymentDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id!));
  }, []);

  const paymentEntity = useAppSelector(state => state.payment.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="paymentDetailsHeading">Payment</h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">ID</span>
          </dt>
          <dd>{paymentEntity.id}</dd>
          <dt>
            <span id="amount">Amount</span>
          </dt>
          <dd>{paymentEntity.amount}</dd>
          <dt>
            <span id="method">Method</span>
          </dt>
          <dd>{paymentEntity.method}</dd>
          <dt>
            <span id="status">Status</span>
          </dt>
          <dd>{paymentEntity.status}</dd>
          <dt>
            <span id="paidDate">Paid Date</span>
          </dt>
          <dd>{paymentEntity.paidDate ? <TextFormat value={paymentEntity.paidDate} type="date" format={APP_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="notes">Notes</span>
          </dt>
          <dd>{paymentEntity.notes}</dd>
          <dt>Booking</dt>
          <dd>{paymentEntity.booking ? paymentEntity.booking.id : ''}</dd>
          <dt>Recorded By</dt>
          <dd>{paymentEntity.recordedBy ? paymentEntity.recordedBy.login : ''}</dd>
        </dl>
        <Button as={Link as any} to="/payment" replace variant="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" /> <span className="d-none d-md-inline">Back</span>
        </Button>
        &nbsp;
        <Button as={Link as any} to={`/payment/${paymentEntity.id}/edit`} replace variant="primary">
          <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
        </Button>
      </Col>
    </Row>
  );
};

export default PaymentDetail;
