import type { IUserPublic } from '@amira/shared';

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
}

export interface UserListDTO {
  users: IUserPublic[];
  total: number;
}
