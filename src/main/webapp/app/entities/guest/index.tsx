import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Guest from './guest';
import GuestDeleteDialog from './guest-delete-dialog';
import GuestDetail from './guest-detail';
import GuestUpdate from './guest-update';

const GuestRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Guest />} />
    <Route path="new" element={<GuestUpdate />} />
    <Route path=":id">
      <Route index element={<GuestDetail />} />
      <Route path="edit" element={<GuestUpdate />} />
      <Route path="delete" element={<GuestDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default GuestRoutes;
