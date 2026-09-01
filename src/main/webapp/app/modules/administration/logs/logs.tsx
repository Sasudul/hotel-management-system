import React, { useEffect, useState } from 'react';
import { Badge, Button, ButtonGroup, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faSyncAlt, faUserShield } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import dayjs from 'dayjs';

type SystemLog = {
  id: number;
  action: string;
  performedBy: string;
  actorRole: string;
  details: string;
  performedDate: string;
};

const roleFilters = [
  { label: 'All Logs', value: '' },
  { label: 'Staff Users', value: 'STAFF' },
  { label: 'Admins', value: 'ADMIN' },
  { label: 'Guest Users', value: 'USER' },
];

export const LogsPage = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSystemLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get<SystemLog[]>('/api/admin/audits/system', {
        params: {
          size: 100,
          sort: 'performedDate,desc',
          ...(roleFilter ? { actorRole: roleFilter } : {}),
        },
      });
      setLogs(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemLogs();
  }, [roleFilter]);

  const badgeVariant = (role: string) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'STAFF') return 'info';
    if (role === 'USER') return 'success';
    return 'secondary';
  };

  return (
    <div className="hms-admin-shell">
      <div className="hms-admin-header">
        <div>
          <h2 id="logs-page-heading" data-cy="logsPageHeading">
            <FontAwesomeIcon icon={faClipboardList} className="me-2 text-primary" />
            System Logs
          </h2>
          <p>Track who signed in, when they entered the system, and which authority level they used.</p>
        </div>
        <Button variant="outline-primary" onClick={fetchSystemLogs} disabled={loading}>
          <FontAwesomeIcon icon={faSyncAlt} spin={loading} className="me-2" />
          Refresh
        </Button>
      </div>

      <div className="hms-filter-bar">
        <FontAwesomeIcon icon={faUserShield} className="text-primary" />
        <ButtonGroup>
          {roleFilters.map(filter => (
            <Button
              key={filter.value || 'all'}
              variant={roleFilter === filter.value ? 'primary' : 'outline-primary'}
              onClick={() => setRoleFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      <div className="table-responsive">
        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Authority</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td className="fw-semibold">{dayjs(log.performedDate).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>{log.performedBy}</td>
                <td>
                  <Badge bg={badgeVariant(log.actorRole)}>{log.actorRole || 'SYSTEM'}</Badge>
                </td>
                <td>{log.details || log.action}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted py-4">
                  No login activity found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default LogsPage;
