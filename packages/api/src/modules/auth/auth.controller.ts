import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../common/responseFormatter.js';
import { config } from '../../config/index.js';

const authService = new AuthService();

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, 201, 'Registration successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  });

  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(req.body);

    res.cookie('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, 200, 'Login successful', {
      user: result.user,
      accessToken: result.tokens.accessToken,
    });
  });

  static refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const oldRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
      sendResponse(res, 401, 'Refresh token required');
      return;
    }

    const result = await authService.refreshToken(oldRefreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, 200, 'Token refreshed', {
      accessToken: result.accessToken,
    });
  });

  static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('refreshToken');
    sendResponse(res, 200, 'Logout successful');
  });

  static forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.forgotPassword(req.body.email);
    // Always return success to prevent email enumeration
    sendResponse(res, 200, 'If the email exists, a reset link has been sent');
  });

  static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendResponse(res, 200, 'Password reset successful');
  });
}
