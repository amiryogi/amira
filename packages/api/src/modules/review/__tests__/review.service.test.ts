import { describe, it, expect, beforeEach } from 'vitest';
import { ReviewService } from '../review.service.js';
import { createTestUser } from '../../../test/factories/user.factory.js';
import { createTestProduct } from '../../../test/factories/product.factory.js';
import mongoose from 'mongoose';

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
  });

  describe('createReview', () => {
    it('should create a review with valid data', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const productId = (product._id as mongoose.Types.ObjectId).toString();

      const result = await reviewService.createReview(userId, {
        productId,
        rating: 5,
        comment: 'Excellent quality pashmina, very warm!',
      });

      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Excellent quality pashmina, very warm!');
      expect(result.isApproved).toBe(false); // Starts unapproved
    });

    it('should throw error for duplicate review', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const productId = (product._id as mongoose.Types.ObjectId).toString();

      await reviewService.createReview(userId, {
        productId,
        rating: 4,
        comment: 'Great product',
      });

      await expect(
        reviewService.createReview(userId, {
          productId,
          rating: 5,
          comment: 'Trying again',
        }),
      ).rejects.toThrow('You have already reviewed this product');
    });

    it('should throw 404 for non-existent product', async () => {
      const user = await createTestUser();
      const fakeProductId = new mongoose.Types.ObjectId().toString();

      await expect(
        reviewService.createReview(
          (user._id as mongoose.Types.ObjectId).toString(),
          {
            productId: fakeProductId,
            rating: 3,
            comment: 'Testing',
          },
        ),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('approveReview', () => {
    it('should approve an unapproved review', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();

      const review = await reviewService.createReview(
        (user._id as mongoose.Types.ObjectId).toString(),
        {
          productId: (product._id as mongoose.Types.ObjectId).toString(),
          rating: 4,
          comment: 'Nice woolen scarf',
        },
      );

      const approved = await reviewService.approveReview(review._id);
      expect(approved.isApproved).toBe(true);
    });

    it('should throw 404 for non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(reviewService.approveReview(fakeId)).rejects.toThrow(
        'Review not found',
      );
    });
  });

  describe('deleteReview', () => {
    it('should allow owner to delete their review', async () => {
      const user = await createTestUser();
      const product = await createTestProduct();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const review = await reviewService.createReview(userId, {
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        rating: 3,
        comment: 'To be deleted',
      });

      await expect(
        reviewService.deleteReview(review._id, userId, false),
      ).resolves.not.toThrow();
    });

    it('should allow admin to delete any review', async () => {
      const user = await createTestUser();
      const admin = await createTestUser({ name: 'Admin' });
      const product = await createTestProduct();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const adminId = (admin._id as mongoose.Types.ObjectId).toString();

      const review = await reviewService.createReview(userId, {
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        rating: 2,
        comment: 'Admin can delete this',
      });

      await expect(
        reviewService.deleteReview(review._id, adminId, true),
      ).resolves.not.toThrow();
    });

    it('should prevent non-owner from deleting review', async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const product = await createTestProduct();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const otherId = (otherUser._id as mongoose.Types.ObjectId).toString();

      const review = await reviewService.createReview(userId, {
        productId: (product._id as mongoose.Types.ObjectId).toString(),
        rating: 1,
        comment: 'Not yours to delete',
      });

      await expect(
        reviewService.deleteReview(review._id, otherId, false),
      ).rejects.toThrow('You can only delete your own reviews');
    });
  });

  describe('getProductReviews', () => {
    it('should return paginated approved reviews', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const product = await createTestProduct();
      const productId = (product._id as mongoose.Types.ObjectId).toString();

      const review1 = await reviewService.createReview(
        (user1._id as mongoose.Types.ObjectId).toString(),
        { productId, rating: 5, comment: 'Great' },
      );
      await reviewService.createReview(
        (user2._id as mongoose.Types.ObjectId).toString(),
        { productId, rating: 4, comment: 'Good' },
      );

      // Approve one review
      await reviewService.approveReview(review1._id);

      const result = await reviewService.getProductReviews(productId, {
        page: 1,
        limit: 10,
      });
      // Only 1 approved
      expect(result.data).toHaveLength(1);
      expect(result.data[0].rating).toBe(5);
    });
  });
});
