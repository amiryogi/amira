import mongoose, { Schema, Document } from 'mongoose';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.plugin(softDeletePlugin);

export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);
