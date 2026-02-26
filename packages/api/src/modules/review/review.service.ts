import { ReviewRepository } from './review.repository.js';
import { ProductRepository } from '../product/product.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { CreateReviewInput, IReview, PaginationParams } from '@amira/shared';
import type { IReviewDocument } from './review.model.js';

export class ReviewService {
  private reviewRepo: ReviewRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.reviewRepo = new ReviewRepository();
    this.productRepo = new ProductRepository();
  }

  async getProductReviews(productId: string, query: PaginationParams) {
    const { skip, limit, sort, page } = buildPagination({ ...query, sort: query.sort || 'createdAt' });

    const [reviews, total] = await Promise.all([
      this.reviewRepo.findByProductId(productId, sort, skip, limit),
      this.reviewRepo.countByProductId(productId),
    ]);

    return {
      data: reviews.map(this.toReview),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async createReview(userId: string, input: CreateReviewInput): Promise<IReview> {
    // Check product exists
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check for duplicate review
    const existing = await this.reviewRepo.findByUserAndProduct(userId, input.productId);
    if (existing) {
      throw ApiError.conflict('You have already reviewed this product');
    }

    const review = await this.reviewRepo.create({
      productId: product._id,
      userId,
      rating: input.rating,
      comment: input.comment,
      isApproved: false,
    } as Partial<IReviewDocument>);

    return this.toReview(review);
  }

  async deleteReview(reviewId: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (!isAdmin && review.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    await this.reviewRepo.delete(reviewId);

    // Recalculate product rating
    await this.recalculateRating(review.productId.toString());
  }

  async approveReview(reviewId: string): Promise<IReview> {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const approved = await this.reviewRepo.approve(reviewId);
    if (!approved) throw ApiError.notFound('Review not found');

    // Recalculate product rating
    await this.recalculateRating(review.productId.toString());

    return this.toReview(approved);
  }

  async adminListReviews(query: PaginationParams & { isApproved?: string }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.isApproved !== undefined) {
      filter.isApproved = query.isApproved === 'true';
    }

    const [reviews, total] = await Promise.all([
      this.reviewRepo.findPaginated(filter, sort, skip, limit),
      this.reviewRepo.count(filter),
    ]);

    return {
      data: reviews.map(this.toReview),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  private async recalculateRating(productId: string): Promise<void> {
    const { averageRating, totalReviews } = await this.reviewRepo.aggregateRating(productId);
    await this.productRepo.updateRating(productId, averageRating, totalReviews);
  }

  private toReview(doc: IReviewDocument): IReview & { user?: { name: string; email: string }; product?: { name: string } } {
    // Handle populated user
    const populatedUser = typeof doc.userId === 'object' && doc.userId !== null && 'email' in doc.userId
      ? doc.userId as unknown as { _id: { toString(): string }; name: string; email: string }
      : null;
    // Handle populated product
    const populatedProduct = typeof doc.productId === 'object' && doc.productId !== null && 'name' in doc.productId
      ? doc.productId as unknown as { _id: { toString(): string }; name: string; slug: string }
      : null;

    return {
      _id: doc._id as string,
      productId: populatedProduct ? populatedProduct._id.toString() : doc.productId.toString(),
      userId: populatedUser ? populatedUser._id.toString() : doc.userId.toString(),
      rating: doc.rating,
      comment: doc.comment,
      isApproved: doc.isApproved,
      createdAt: doc.createdAt.toISOString(),
      ...(populatedUser && { user: { name: populatedUser.name, email: populatedUser.email } }),
      ...(populatedProduct && { product: { name: populatedProduct.name } }),
    };
  }
}
