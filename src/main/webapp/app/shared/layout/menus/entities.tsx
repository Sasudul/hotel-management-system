import React from 'react';

import EntitiesMenuItems from 'app/entities/menu';

import { NavDropdown } from './menu-components';

export const EntitiesMenu = () => (
  <NavDropdown icon="building" name="Hotel Operations" id="entity-menu" data-cy="entity" style={{ maxHeight: '80vh', overflow: 'auto' }}>
    <EntitiesMenuItems />
  </NavDropdown>
);
