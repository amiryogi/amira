import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@amira/shared';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  isDeleted: boolean;
  tokenVersion: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      index: true,
    },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.plugin(softDeletePlugin);

export const User = mongoose.model<IUserDocument>('User', userSchema);
