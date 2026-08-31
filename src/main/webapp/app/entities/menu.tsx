import React from 'react';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="asterisk" to="/room">
        Room
      </MenuItem>
      <MenuItem icon="asterisk" to="/guest">
        Guest
      </MenuItem>
      <MenuItem icon="asterisk" to="/booking">
        Booking
      </MenuItem>
      <MenuItem icon="asterisk" to="/payment">
        Payment
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
