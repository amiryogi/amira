import { Review, IReviewDocument } from './review.model.js';
import mongoose from 'mongoose';

export class ReviewRepository {
  async create(data: Partial<IReviewDocument>): Promise<IReviewDocument> {
    return Review.create(data);
  }

  async findById(id: string): Promise<IReviewDocument | null> {
    return Review.findById(id);
  }

  async findByProductId(
    productId: string,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IReviewDocument[]> {
    return Review.find({ productId: new mongoose.Types.ObjectId(productId), isApproved: true })
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countByProductId(productId: string): Promise<number> {
    return Review.countDocuments({ productId: new mongoose.Types.ObjectId(productId), isApproved: true });
  }

  async findPaginated(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IReviewDocument[]> {
    return Review.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Review.countDocuments(filter);
  }

  async delete(id: string): Promise<void> {
    await Review.findByIdAndDelete(id);
  }

  async approve(id: string): Promise<IReviewDocument | null> {
    return Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
  }

  async aggregateRating(productId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    };
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<IReviewDocument | null> {
    return Review.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    });
  }
}
