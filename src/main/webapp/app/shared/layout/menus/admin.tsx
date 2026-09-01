import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';

import { NavDropdown } from './menu-components';

const adminMenuItems = () => (
  <>
    <MenuItem icon="tasks" to="/admin/logs">
      System Logs
    </MenuItem>
    <MenuItem icon="history" to="/admin/audits">
      Activity Logs
    </MenuItem>
    <MenuItem icon="users" to="/admin/user-management">
      Manage Staff Accounts
    </MenuItem>
  </>
);

export const AdminMenu = () => (
  <NavDropdown icon="cogs" name="System" id="admin-menu" data-cy="adminMenu">
    {adminMenuItems()}
  </NavDropdown>
);
