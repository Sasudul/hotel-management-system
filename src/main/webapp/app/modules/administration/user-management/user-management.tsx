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
    <div className="pt-4 pb-5">
      <div className="premium-card mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="premium-title mb-1">
            <FontAwesomeIcon icon={faUsers} className="me-3" style={{ color: '#0052cc' }} />
            Staff & User Management
          </h2>
          <p className="premium-subtitle mb-0">Control system access and assign responsibilities to accounts.</p>
        </div>
        <button className="premium-btn" onClick={fetchUsers} disabled={loading}>
          <FontAwesomeIcon icon="sync" spin={loading} />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="table-responsive">
          <Table hover className="align-middle mb-0" style={{ minWidth: '800px' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th className="py-3 px-4 border-0 text-uppercase text-muted" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  ID
                </th>
                <th className="py-3 px-4 border-0 text-uppercase text-muted" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  Account
                </th>
                <th className="py-3 px-4 border-0 text-uppercase text-muted" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  Name
                </th>
                <th className="py-3 px-4 border-0 text-uppercase text-muted" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  Roles
                </th>
                <th className="py-3 px-4 border-0 text-uppercase text-muted" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f3f5' }}>
                  <td className="py-3 px-4 text-muted" style={{ fontFamily: 'monospace' }}>
                    <FontAwesomeIcon icon={getHighestRoleIcon(user.authorities)} className="me-2" />
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 fw-bold" style={{ color: '#00224F' }}>
                    {user.login}
                  </td>
                  <td className="py-3 px-4">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-4">
                    {user.authorities.map((role, i) => {
                      let bg = 'secondary';
                      if (role === 'ROLE_ADMIN') bg = 'danger';
                      if (role === 'ROLE_RECEPTIONIST') bg = 'info';
                      if (role === 'ROLE_USER') bg = 'success';
                      return (
                        <Badge bg={bg} key={i} className="me-1 px-2 py-1 rounded-pill" style={{ fontWeight: '500' }}>
                          {role.replace('ROLE_', '')}
                        </Badge>
                      );
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="outline-primary"
                      className="rounded-pill px-3"
                      size="sm"
                      onClick={() => openRoleModal(user)}
                      style={{ fontWeight: '600' }}
                    >
                      Manage Roles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} contentClassName="border-0 shadow-lg" centered>
        <div className="premium-modal-header d-flex justify-content-between align-items-center">
          <h4 className="premium-modal-title">Manage Roles</h4>
          <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowRoleModal(false)}></button>
        </div>
        <div className="premium-modal-body">
          <p className="text-muted mb-4">
            Assign responsibilities to <strong>{selectedUser?.login}</strong>. Selecting higher roles grants more access.
          </p>
          <Form>
            <div
              className="p-3 mb-3 rounded"
              style={{
                border: '1px solid #e9ecef',
                background: selectedRoles.includes('ROLE_ADMIN') ? '#f0f7ff' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <Form.Check
                type="checkbox"
                id="role-admin"
                label={
                  <div className="ms-2">
                    <strong style={{ color: '#00224F' }}>ROLE_ADMIN</strong>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Full System Access, Add Rooms, Manage Staff
                    </div>
                  </div>
                }
                checked={selectedRoles.includes('ROLE_ADMIN')}
                onChange={() => handleRoleToggle('ROLE_ADMIN')}
                className="d-flex align-items-center cursor-pointer"
              />
            </div>

            <div
              className="p-3 mb-3 rounded"
              style={{
                border: '1px solid #e9ecef',
                background: selectedRoles.includes('ROLE_RECEPTIONIST') ? '#f0f7ff' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <Form.Check
                type="checkbox"
                id="role-receptionist"
                label={
                  <div className="ms-2">
                    <strong style={{ color: '#00224F' }}>ROLE_RECEPTIONIST</strong>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Staff Portal, Bookings, Guest Profiles
                    </div>
                  </div>
                }
                checked={selectedRoles.includes('ROLE_RECEPTIONIST')}
                onChange={() => handleRoleToggle('ROLE_RECEPTIONIST')}
                className="d-flex align-items-center cursor-pointer"
              />
            </div>

            <div className="p-3 rounded" style={{ border: '1px solid #e9ecef', background: '#f8f9fa' }}>
              <Form.Check
                type="checkbox"
                id="role-user"
                label={
                  <div className="ms-2">
                    <strong style={{ color: '#6c757d' }}>ROLE_USER</strong>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Basic Guest Portal (Default)
                    </div>
                  </div>
                }
                checked={selectedRoles.includes('ROLE_USER')}
                onChange={() => handleRoleToggle('ROLE_USER')}
                className="d-flex align-items-center"
                disabled
              />
            </div>
          </Form>
        </div>
        <div className="premium-modal-footer d-flex justify-content-end gap-2">
          <Button variant="light" className="px-4 fw-bold text-secondary" onClick={() => setShowRoleModal(false)}>
            Cancel
          </Button>
          <button className="premium-btn py-2 px-4" onClick={saveRoles}>
            Save Roles
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
