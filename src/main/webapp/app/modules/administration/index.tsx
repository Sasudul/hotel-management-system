import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Audits from './audits/audits';
import Configuration from './configuration/configuration';
import Docs from './docs/docs';
import Health from './health/health';
import Logs from './logs/logs';
import Metrics from './metrics/metrics';
import UserManagement from './user-management/user-management';

const AdministrationRoutes = () => (
  <div>
    <ErrorBoundaryRoutes>
      <Route path="audits" element={<Audits />} />
      <Route path="health" element={<Health />} />
      <Route path="metrics" element={<Metrics />} />
      <Route path="configuration" element={<Configuration />} />
      <Route path="logs" element={<Logs />} />
      <Route path="docs" element={<Docs />} />
      <Route path="user-management" element={<UserManagement />} />
    </ErrorBoundaryRoutes>
  </div>
);

export default AdministrationRoutes;
