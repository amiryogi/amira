import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const RefreshToken = mongoose.model<IRefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema,
);
