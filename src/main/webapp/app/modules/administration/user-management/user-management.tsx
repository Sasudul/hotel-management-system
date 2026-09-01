import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { faUsers, faUserShield, faUserTie, faUser } from '@fortawesome/free-solid-svg-icons';

interface IUser {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  authorities: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<IUser[]>('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (user: IUser) => {
    setSelectedUser(user);
    setSelectedRoles([...user.authorities]);
    setShowRoleModal(true);
  };

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const saveRoles = async () => {
    if (!selectedUser) return;
    try {
      await axios.post(`/api/admin/users/${selectedUser.login}/roles`, selectedRoles);
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save roles', error);
    }
  };

  const getHighestRoleIcon = (roles: string[]) => {
    if (roles.includes('ROLE_ADMIN')) return faUserShield;
    if (roles.includes('ROLE_RECEPTIONIST')) return faUserTie;
    return faUser;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 id="user-management-page-heading" data-cy="userManagementPageHeading">
          <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
          Staff & User Management
        </h2>
        <Button variant="info" onClick={fetchUsers} disabled={loading}>
          <FontAwesomeIcon icon="sync" spin={loading} /> Refresh List
        </Button>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="align-middle bg-white shadow-sm rounded">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Login (Email)</th>
              <th>Profiles</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="small text-muted">
                  <FontAwesomeIcon icon={getHighestRoleIcon(user.authorities)} className="me-2" />
                  {user.id.substring(0, 8)}...
                </td>
                <td className="fw-bold">{user.login}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>
                  {user.authorities.map((role, i) => {
                    let bg = 'secondary';
                    if (role === 'ROLE_ADMIN') bg = 'danger';
                    if (role === 'ROLE_RECEPTIONIST') bg = 'info';
                    if (role === 'ROLE_USER') bg = 'success';
                    return (
                      <Badge bg={bg} key={i} className="me-1 px-2 py-1">
                        {role.replace('ROLE_', '')}
                      </Badge>
                    );
                  })}
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" onClick={() => openRoleModal(user)}>
                    Manage Roles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Roles: {selectedUser?.login}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Assign responsibilities to this account. Selecting higher roles grants more access.</p>
          <Form>
            <Form.Check
              type="checkbox"
              id="role-admin"
              label={
                <span>
                  <strong>ROLE_ADMIN</strong> (Full System Access, Add Rooms, Manage Staff)
                </span>
              }
              checked={selectedRoles.includes('ROLE_ADMIN')}
              onChange={() => handleRoleToggle('ROLE_ADMIN')}
              className="mb-3 p-3 border rounded shadow-sm"
            />
            <Form.Check
              type="checkbox"
              id="role-receptionist"
              label={
                <span>
                  <strong>ROLE_RECEPTIONIST</strong> (Staff Portal, Bookings, Guest Profiles)
                </span>
              }
              checked={selectedRoles.includes('ROLE_RECEPTIONIST')}
              onChange={() => handleRoleToggle('ROLE_RECEPTIONIST')}
              className="mb-3 p-3 border rounded shadow-sm"
            />
            <Form.Check
              type="checkbox"
              id="role-user"
              label={
                <span>
                  <strong>ROLE_USER</strong> (Basic Guest Portal - Default)
                </span>
              }
              checked={selectedRoles.includes('ROLE_USER')}
              onChange={() => handleRoleToggle('ROLE_USER')}
              className="mb-3 p-3 border rounded shadow-sm"
              disabled
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveRoles}>
            Save Roles
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
