export interface IReview {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}
