import { IUser } from 'app/shared/model/user.model';

export interface IGuest {
  id?: number;
  phone?: string;
  address?: string | null;
  idDocumentNumber?: string;
  user?: IUser;
}

export const defaultValue: Readonly<IGuest> = {};
