import dayjs from 'dayjs';

import { IBooking } from 'app/shared/model/booking.model';
import { PaymentMethod } from 'app/shared/model/enumerations/payment-method.model';
import { PaymentStatus } from 'app/shared/model/enumerations/payment-status.model';
import { IUser } from 'app/shared/model/user.model';

export interface IPayment {
  id?: number;
  amount?: number;
  method?: keyof typeof PaymentMethod;
  status?: keyof typeof PaymentStatus;
  paidDate?: dayjs.Dayjs | null;
  notes?: string | null;
  booking?: IBooking;
  recordedBy?: IUser | null;
}

export const defaultValue: Readonly<IPayment> = {};
