import React, { useEffect } from 'react';
import { Button, Col, FormText, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { Link, useNavigate, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getBookings } from 'app/entities/booking/booking.reducer';
import { PaymentMethod } from 'app/shared/model/enumerations/payment-method.model';
import { PaymentStatus } from 'app/shared/model/enumerations/payment-status.model';
import { getUsers } from 'app/shared/reducers/user-management';
import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';

import { createEntity, getEntity, reset, updateEntity } from './payment.reducer';

export const PaymentUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const bookings = useAppSelector(state => state.booking.entities);
  const users = useAppSelector(state => state.userManagement.users);
  const paymentEntity = useAppSelector(state => state.payment.entity);
  const loading = useAppSelector(state => state.payment.loading);
  const updating = useAppSelector(state => state.payment.updating);
  const updateSuccess = useAppSelector(state => state.payment.updateSuccess);
  const paymentMethodValues = Object.keys(PaymentMethod);
  const paymentStatusValues = Object.keys(PaymentStatus);

  const handleClose = () => {
    navigate(`/payment${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getBookings({}));
    dispatch(getUsers({}));
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
    if (values.amount !== undefined && typeof values.amount !== 'number') {
      values.amount = Number(values.amount);
    }
    values.paidDate = convertDateTimeToServer(values.paidDate);

    const entity = {
      ...paymentEntity,
      ...values,
      booking: bookings.find(it => it.id.toString() === values.booking?.toString()),
      recordedBy: users.find(it => it.id.toString() === values.recordedBy?.toString()),
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
          paidDate: displayDefaultDateTime(),
        }
      : {
          method: 'CASH',
          status: 'PENDING',
          ...paymentEntity,
          paidDate: convertDateTimeFromServer(paymentEntity.paidDate),
          booking: paymentEntity?.booking?.id,
          recordedBy: paymentEntity?.recordedBy?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="hotelManagementSystemApp.payment.home.createOrEditLabel" data-cy="PaymentCreateUpdateHeading">
            Create or edit a Payment
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew && <ValidatedField name="id" required readOnly id="payment-id" label="ID" validate={{ required: true }} />}
              <ValidatedField
                label="Amount"
                id="payment-amount"
                name="amount"
                data-cy="amount"
                type="text"
                validate={{
                  required: { value: true, message: 'This field is required.' },
                  min: { value: 0, message: 'This field should be at least 0.' },
                  validate: v => isNumber(v) || 'This field should be a number.',
                }}
              />
              <ValidatedField label="Method" id="payment-method" name="method" data-cy="method" type="select">
                {paymentMethodValues.map(paymentMethod => (
                  <option value={paymentMethod} key={paymentMethod}>
                    {paymentMethod}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField label="Status" id="payment-status" name="status" data-cy="status" type="select">
                {paymentStatusValues.map(paymentStatus => (
                  <option value={paymentStatus} key={paymentStatus}>
                    {paymentStatus}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label="Paid Date"
                id="payment-paidDate"
                name="paidDate"
                data-cy="paidDate"
                type="datetime-local"
                placeholder="YYYY-MM-DD HH:mm"
              />
              <ValidatedField
                label="Notes"
                id="payment-notes"
                name="notes"
                data-cy="notes"
                type="text"
                validate={{
                  maxLength: { value: 500, message: 'This field cannot be longer than 500 characters.' },
                }}
              />
              <ValidatedField id="payment-booking" name="booking" data-cy="booking" label="Booking" type="select" required>
                <option value="" key="0" />
                {bookings
                  ? bookings.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.id}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <FormText>This field is required.</FormText>
              <ValidatedField id="payment-recordedBy" name="recordedBy" data-cy="recordedBy" label="Recorded By" type="select">
                <option value="" key="0" />
                {users
                  ? users.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.login}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button as={Link as any} id="cancel-save" data-cy="entityCreateCancelButton" to="/payment" replace variant="info">
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

export default PaymentUpdate;
