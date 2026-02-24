import mongoose, { Schema, Document } from 'mongoose';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

export interface IProductVariantDoc {
  size?: string;
  color?: string;
  stock?: number;
}

export interface IProductDocument extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  variants: IProductVariantDoc[];
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productVariantSchema = new Schema<IProductVariantDoc>(
  {
    size: { type: String },
    color: { type: String },
    stock: { type: Number, min: 0 },
  },
  { _id: false },
);

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0, index: true },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    variants: [productVariantSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.plugin(softDeletePlugin);

// Text index for search
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProductDocument>('Product', productSchema);
