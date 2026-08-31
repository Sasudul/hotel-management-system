import React from 'react';
import { Route } from 'react-router';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Booking from './booking';
import Guest from './guest';
import Payment from './payment';
import Room from './room';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="/room/*" element={<Room />} />
        <Route path="/guest/*" element={<Guest />} />
        <Route path="/booking/*" element={<Booking />} />
        <Route path="/payment/*" element={<Payment />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
