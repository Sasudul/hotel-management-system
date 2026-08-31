import booking from 'app/entities/booking/booking.reducer';
import guest from 'app/entities/guest/guest.reducer';
import payment from 'app/entities/payment/payment.reducer';
import room from 'app/entities/room/room.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  room,
  guest,
  booking,
  payment,
  // jhipster-needle-add-reducer-combine - JHipster will add reducer here
};

export default entitiesReducers;
