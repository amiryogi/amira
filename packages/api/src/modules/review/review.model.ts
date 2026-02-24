import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5, index: true },
    comment: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// One user can review a product only once
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model<IReviewDocument>('Review', reviewSchema);
