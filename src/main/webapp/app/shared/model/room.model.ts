import { RoomStatus } from 'app/shared/model/enumerations/room-status.model';
import { RoomType } from 'app/shared/model/enumerations/room-type.model';

export interface IRoom {
  id?: number;
  roomNumber?: string;
  roomType?: keyof typeof RoomType;
  pricePerNight?: number;
  capacity?: number;
  status?: keyof typeof RoomStatus;
  description?: string | null;
  amenities?: string | null;
  imageUrl?: string | null; // Production quality comment: URL of the room's image
}

export const defaultValue: Readonly<IRoom> = {};
