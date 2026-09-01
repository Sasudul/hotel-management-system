import React, { useEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { ValidatedField, ValidatedForm, isNumber } from 'react-jhipster';
import { Link, useNavigate, useParams } from 'react-router';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useAppDispatch, useAppSelector } from 'app/config/store';
import { RoomStatus } from 'app/shared/model/enumerations/room-status.model';
import { RoomType } from 'app/shared/model/enumerations/room-type.model';

import { createEntity, getEntity, reset, updateEntity } from './room.reducer';

export const RoomUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const roomEntity = useAppSelector(state => state.room.entity);
  const loading = useAppSelector(state => state.room.loading);
  const updating = useAppSelector(state => state.room.updating);
  const updateSuccess = useAppSelector(state => state.room.updateSuccess);
  const roomTypeValues = Object.keys(RoomType);
  const roomStatusValues = Object.keys(RoomStatus);

  const handleClose = () => {
    navigate(`/room${location.search}`);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }
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
    if (values.pricePerNight !== undefined && typeof values.pricePerNight !== 'number') {
      values.pricePerNight = Number(values.pricePerNight);
    }
    if (values.capacity !== undefined && typeof values.capacity !== 'number') {
      values.capacity = Number(values.capacity);
    }

    const entity = {
      ...roomEntity,
      ...values,
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          roomType: 'SINGLE',
          status: 'AVAILABLE',
          ...roomEntity,
        };

  return (
    <div className="hms-edit-page">
      <Row className="justify-content-center">
        <Col xl="9" lg="10">
          <div className="hms-form-title">
            <div>
              <span className="hms-eyebrow">Inventory</span>
              <h2 id="hotelManagementSystemApp.room.home.createOrEditLabel" data-cy="RoomCreateUpdateHeading">
                {isNew ? 'Create Room' : 'Edit Room'}
              </h2>
            </div>
            <span className="hms-title-pill">Grand Hotel Sri Lanka</span>
          </div>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xl="9" lg="10">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm className="hms-entity-form" defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew && <ValidatedField name="id" required readOnly id="room-id" label="ID" validate={{ required: true }} />}
              <div className="hms-form-section">
                <h3>Room Setup</h3>
                <div className="hms-form-grid">
                  <ValidatedField
                    label="Room Number"
                    id="room-roomNumber"
                    name="roomNumber"
                    data-cy="roomNumber"
                    type="text"
                    validate={{ required: { value: true, message: 'This field is required.' } }}
                  />
                  <ValidatedField label="Room Type" id="room-roomType" name="roomType" data-cy="roomType" type="select">
                    {roomTypeValues.map(roomType => (
                      <option value={roomType} key={roomType}>
                        {roomType}
                      </option>
                    ))}
                  </ValidatedField>
                  <ValidatedField
                    label="Price Per Night (LKR)"
                    id="room-pricePerNight"
                    name="pricePerNight"
                    data-cy="pricePerNight"
                    type="number"
                    validate={{
                      required: { value: true, message: 'This field is required.' },
                      min: { value: 0, message: 'This field should be at least 0.' },
                      validate: v => isNumber(v) || 'This field should be a number.',
                    }}
                  />
                  <ValidatedField
                    label="Capacity"
                    id="room-capacity"
                    name="capacity"
                    data-cy="capacity"
                    type="number"
                    validate={{
                      required: { value: true, message: 'This field is required.' },
                      min: { value: 1, message: 'This field should be at least 1.' },
                      validate: v => isNumber(v) || 'This field should be a number.',
                    }}
                  />
                  <ValidatedField label="Status" id="room-status" name="status" data-cy="status" type="select">
                    {roomStatusValues.map(roomStatus => (
                      <option value={roomStatus} key={roomStatus}>
                        {roomStatus}
                      </option>
                    ))}
                  </ValidatedField>
                  <ValidatedField label="Image URL" id="room-imageUrl" name="imageUrl" data-cy="imageUrl" type="url" />
                </div>
              </div>
              <div className="hms-form-section">
                <h3>Guest-Facing Details</h3>
                <ValidatedField
                  label="Description"
                  id="room-description"
                  name="description"
                  data-cy="description"
                  type="textarea"
                  validate={{ maxLength: { value: 1000, message: 'This field cannot be longer than 1000 characters.' } }}
                />
                <ValidatedField
                  label="Amenities"
                  id="room-amenities"
                  name="amenities"
                  data-cy="amenities"
                  type="textarea"
                  validate={{ maxLength: { value: 500, message: 'This field cannot be longer than 500 characters.' } }}
                />
              </div>
              <div className="hms-form-actions">
                <Button as={Link as any} id="cancel-save" data-cy="entityCreateCancelButton" to="/room" replace variant="info">
                  <FontAwesomeIcon icon="arrow-left" />
                  <span>Back</span>
                </Button>
                <Button variant="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                  <FontAwesomeIcon icon="save" />
                  <span>{updating ? 'Saving...' : 'Save Room'}</span>
                </Button>
              </div>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default RoomUpdate;
