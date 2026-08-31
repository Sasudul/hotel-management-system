import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, FormLabel, FormControl, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

export const Profile = () => {
  const [profile, setProfile] = useState<any>({
    phone: '',
    address: '',
    idCardNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/guests/current');
      if (response.data) {
        setProfile({
          phone: response.data.phone || '',
          address: response.data.address || '',
          idCardNumber: response.data.idCardNumber || '',
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load profile details.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put('/api/guests/current', profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <Container className="pt-4">
      <Row className="justify-content-center">
        <Col md="8">
          <h2 className="mb-4">My Profile</h2>
          <Form onSubmit={handleSave}>
            <FormGroup className="mb-3">
              <FormLabel htmlFor="phone">Phone Number</FormLabel>
              <FormControl
                type="text"
                name="phone"
                id="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </FormGroup>
            <FormGroup className="mb-3">
              <FormLabel htmlFor="address">Address</FormLabel>
              <FormControl
                as="textarea"
                name="address"
                id="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </FormGroup>
            <FormGroup className="mb-3">
              <FormLabel htmlFor="idCardNumber">ID Card / Passport Number</FormLabel>
              <FormControl
                type="text"
                name="idCardNumber"
                id="idCardNumber"
                value={profile.idCardNumber}
                onChange={handleChange}
                placeholder="Enter ID / Passport Number"
              />
            </FormGroup>
            <Button variant="primary" type="submit">
              Save Profile
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
