export interface IProductVariant {
  size?: string;
  color?: string;
  stock?: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  categoryId: string;
  variants: IProductVariant[];
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId: string;
  variants?: IProductVariant[];
  isFeatured?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;
