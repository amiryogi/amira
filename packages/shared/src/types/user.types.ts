import { UserRole } from '../enums/role.enum';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  isDeleted: boolean;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

/** User without sensitive fields — used in API responses */
export type IUserPublic = Omit<IUser, 'password' | 'tokenVersion' | 'isDeleted'>;
