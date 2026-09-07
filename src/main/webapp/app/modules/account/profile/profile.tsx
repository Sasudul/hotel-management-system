import React, { useState, useEffect } from 'react';
import { Form, FormGroup, FormLabel, FormControl, Container, Row, Col } from 'react-bootstrap';
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
    } catch (err: any) {
      console.error(err);
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
    <Container className="pt-5 pb-5">
      <Row className="justify-content-center">
        <Col xl="8" lg="9">
          <div className="premium-card">
            <h2 className="premium-title">My Profile</h2>
            <p className="premium-subtitle">Manage your personal information and contact details.</p>

            <Form onSubmit={handleSave}>
              <h4 className="mb-4 fw-bold" style={{ color: '#00224F' }}>
                Contact Details
              </h4>
              <div className="premium-grid mb-4">
                <FormGroup>
                  <FormLabel className="premium-label" htmlFor="phone">
                    Phone Number
                  </FormLabel>
                  <FormControl
                    className="premium-input"
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
                  <FormLabel className="premium-label" htmlFor="idDocumentNumber">
                    ID Card / Passport Number
                  </FormLabel>
                  <FormControl
                    className="premium-input"
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

              <h4 className="mb-4 fw-bold" style={{ color: '#00224F' }}>
                Address
              </h4>
              <FormGroup className="mb-5">
                <FormLabel className="premium-label" htmlFor="address">
                  Full Address
                </FormLabel>
                <FormControl
                  className="premium-input"
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

              <div className="d-flex justify-content-end mt-4">
                <button className="premium-btn" type="submit" disabled={loading}>
                  <FontAwesomeIcon icon="save" />
                  <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
