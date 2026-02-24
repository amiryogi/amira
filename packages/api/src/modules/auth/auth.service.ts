import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../../config/index.js';
import { User, IUserDocument } from '../user/user.model.js';
import { AuthRepository } from './auth.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { logger } from '../../utils/logger.js';
import type { LoginInput, RegisterInput, IUserPublic } from '@amira/shared';
import type { LoginResponseDTO, RegisterResponseDTO, RefreshResponseDTO } from './auth.dto.js';

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  async register(input: RegisterInput): Promise<RegisterResponseDTO> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, config.bcryptSaltRounds);

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
    });

    const tokens = await this.generateTokens(user);
    const userPublic = this.toPublicUser(user);

    logger.info(`User registered: ${user.email}`);

    return { user: userPublic, tokens };
  }

  async login(input: LoginInput): Promise<LoginResponseDTO> {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for: ${input.email}`);
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    const userPublic = this.toPublicUser(user);

    logger.info(`User logged in: ${user.email}`);

    return { user: userPublic, tokens };
  }

  async refreshToken(oldRefreshToken: string): Promise<RefreshResponseDTO> {
    const storedToken = await this.authRepo.findRefreshToken(oldRefreshToken);
    if (!storedToken) {
      // Potential token reuse — invalidate all sessions
      try {
        const decoded = jwt.verify(oldRefreshToken, config.refreshSecret) as { userId: string };
        await this.authRepo.revokeAllUserTokens(decoded.userId);
        logger.warn(`Refresh token reuse detected for user: ${decoded.userId}`);
      } catch {
        // Token is completely invalid
      }
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.authRepo.revokeRefreshToken(oldRefreshToken);
      throw ApiError.unauthorized('Refresh token expired');
    }

    // Revoke old refresh token (rotation)
    await this.authRepo.revokeRefreshToken(oldRefreshToken);

    const user = await User.findById(storedToken.userId);
    if (!user || user.isDeleted) {
      throw ApiError.unauthorized('User not found');
    }

    const tokens = await this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepo.revokeRefreshToken(refreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // TODO: Send email with reset token via notification service
    logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion += 1; // Invalidate all existing tokens
    await user.save();

    // Revoke all refresh tokens
    await this.authRepo.revokeAllUserTokens(user._id as string);

    logger.info(`Password reset successful for: ${user.email}`);
  }

  // ─── Private helpers ───

  private async generateTokens(user: IUserDocument) {
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role, tokenVersion: user.tokenVersion },
      config.accessSecret,
      { expiresIn: '15m' },
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      config.refreshSecret,
      { expiresIn: '7d' },
    );

    await this.authRepo.createRefreshToken({
      userId: user._id as mongoose.Types.ObjectId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  private toPublicUser(user: IUserDocument): IUserPublic {
    return {
      _id: user._id as string,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

// Need mongoose for ObjectId type
import mongoose from 'mongoose';
