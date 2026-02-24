import mongoose, { Schema, Document } from 'mongoose';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

export interface IAddressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, required: true, maxlength: 50 },
    fullName: { type: String, required: true, maxlength: 100 },
    phone: { type: String, required: true },
    street: { type: String, required: true, maxlength: 200 },
    city: { type: String, required: true, maxlength: 100 },
    district: { type: String, required: true, maxlength: 100 },
    province: { type: String, required: true, maxlength: 100 },
    postalCode: { type: String, maxlength: 10 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.plugin(softDeletePlugin);
addressSchema.index({ userId: 1, isDefault: 1 });

export const Address = mongoose.model<IAddressDocument>('Address', addressSchema);
