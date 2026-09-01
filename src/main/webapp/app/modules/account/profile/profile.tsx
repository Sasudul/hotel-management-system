import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, FormLabel, FormControl, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Profile = () => {
  const [profile, setProfile] = useState<any>({
    phone: '',
    address: '',
    idDocumentNumber: '',
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/guests/current');
      if (response.data) {
        setProfile({
          phone: response.data.phone || '',
          address: response.data.address || '',
          idDocumentNumber: response.data.idDocumentNumber || '',
        });
      }
    } catch (error: any) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/guests/current', profile);
      toast.success('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <Container className="hms-edit-page pt-4">
      <Row className="justify-content-center">
        <Col xl="8" lg="9">
          <div className="hms-form-title">
            <div>
              <span className="hms-eyebrow">Guest Account</span>
              <h2 className="mb-0">My Profile</h2>
            </div>
            <span className="hms-title-pill">Production-ready guest record</span>
          </div>
          <Form className="hms-entity-form" onSubmit={handleSave}>
            <div className="hms-form-section">
              <h3>Contact Details</h3>
              <div className="hms-form-grid">
                <FormGroup>
                  <FormLabel htmlFor="phone">Phone Number</FormLabel>
                  <FormControl
                    type="text"
                    name="phone"
                    id="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="+94 77 123 4567"
                    disabled={loading}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="idDocumentNumber">ID Card / Passport Number</FormLabel>
                  <FormControl
                    type="text"
                    name="idDocumentNumber"
                    id="idDocumentNumber"
                    value={profile.idDocumentNumber}
                    onChange={handleChange}
                    placeholder="NIC or passport number"
                    disabled={loading}
                  />
                </FormGroup>
              </div>
            </div>
            <div className="hms-form-section">
              <h3>Address</h3>
              <FormGroup>
                <FormLabel htmlFor="address">Address</FormLabel>
                <FormControl
                  as="textarea"
                  rows={4}
                  name="address"
                  id="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Street, city, country"
                  disabled={loading}
                />
              </FormGroup>
            </div>
            <div className="hms-form-actions">
              <Button variant="primary" type="submit" disabled={loading}>
                <FontAwesomeIcon icon="save" />
                <span>{loading ? 'Loading...' : 'Save Profile'}</span>
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
