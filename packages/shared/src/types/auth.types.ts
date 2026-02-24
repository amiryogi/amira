export interface IRefreshToken {
  _id: string;
  userId: string;
  token: string;
  expiresAt: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}
