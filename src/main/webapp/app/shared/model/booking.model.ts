import dayjs from 'dayjs';

import { BookingStatus } from 'app/shared/model/enumerations/booking-status.model';
import { IGuest } from 'app/shared/model/guest.model';
import { IRoom } from 'app/shared/model/room.model';

export interface IBooking {
  id?: number;
  checkInDate?: dayjs.Dayjs;
  checkOutDate?: dayjs.Dayjs;
  status?: keyof typeof BookingStatus;
  totalAmount?: number;
  numberOfGuests?: number;
  specialRequests?: string | null;
  createdDate?: dayjs.Dayjs;
  cancelledReason?: string | null;
  guest?: IGuest;
  room?: IRoom;
}

export const defaultValue: Readonly<IBooking> = {};
