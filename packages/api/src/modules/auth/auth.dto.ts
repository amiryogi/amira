import type { IUserPublic } from '@amira/shared';

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDTO {
  user: IUserPublic;
  tokens: AuthTokensDTO;
}

export interface RegisterResponseDTO {
  user: IUserPublic;
  tokens: AuthTokensDTO;
}

export interface RefreshResponseDTO {
  accessToken: string;
  refreshToken: string;
}
