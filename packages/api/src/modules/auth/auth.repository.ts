import { RefreshToken, IRefreshTokenDocument } from './auth.model.js';
import mongoose from 'mongoose';

export class AuthRepository {
  async createRefreshToken(data: {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
  }): Promise<IRefreshTokenDocument> {
    return RefreshToken.create(data);
  }

  async findRefreshToken(token: string): Promise<IRefreshTokenDocument | null> {
    return RefreshToken.findOne({ token, isRevoked: false });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await RefreshToken.updateOne({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRevoked: false },
      { isRevoked: true },
    );
  }

  async findActiveTokensByUser(userId: string): Promise<IRefreshTokenDocument[]> {
    return RefreshToken.find({
      userId: new mongoose.Types.ObjectId(userId),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }
}
