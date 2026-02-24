import mongoose from 'mongoose';
import { Product, IProductDocument } from '../../modules/product/product.model.js';
import { createTestCategory } from './category.factory.js';

interface CreateProductOverrides {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  stock?: number;
  images?: string[];
  categoryId?: mongoose.Types.ObjectId;
  variants?: Array<{ size?: string; color?: string; stock?: number }>;
  isFeatured?: boolean;
  isActive?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

let productCounter = 0;

const NEPAL_PRODUCTS = [
  'Himalayan Pashmina Shawl',
  'Handknit Yak Wool Sweater',
  'Everest Woolen Cap',
  'Traditional Dhaka Topi',
  'Felt Flower Bag',
  'Cashmere Wrap Scarf',
  'Tibetan Wool Blanket',
  'Nepali Wool Socks',
];

export async function createTestProduct(
  overrides: CreateProductOverrides = {},
): Promise<IProductDocument> {
  productCounter++;

  let categoryId = overrides.categoryId;
  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category._id as mongoose.Types.ObjectId;
  }

  const name =
    overrides.name ?? NEPAL_PRODUCTS[(productCounter - 1) % NEPAL_PRODUCTS.length];
  const slug =
    overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-') + `-${productCounter}`;

  return Product.create({
    name,
    slug,
    description:
      overrides.description ??
      `Premium quality ${name} handcrafted in the highlands of Nepal. Made with traditional techniques.`,
    price: overrides.price ?? 2500 + productCounter * 100,
    discountPrice: overrides.discountPrice,
    stock: overrides.stock ?? 50,
    images: overrides.images ?? [
      'https://test-cloudinary.com/image1.jpg',
      'https://test-cloudinary.com/image2.jpg',
    ],
    categoryId,
    variants: overrides.variants ?? [
      { size: 'M', color: 'Natural White', stock: 25 },
      { size: 'L', color: 'Grey', stock: 25 },
    ],
    isFeatured: overrides.isFeatured ?? false,
    isActive: overrides.isActive ?? true,
    averageRating: overrides.averageRating ?? 0,
    totalReviews: overrides.totalReviews ?? 0,
  });
}

export async function createTestProducts(
  count: number,
  overrides: CreateProductOverrides = {},
): Promise<IProductDocument[]> {
  const products: IProductDocument[] = [];
  for (let i = 0; i < count; i++) {
    products.push(await createTestProduct(overrides));
  }
  return products;
}

export function resetProductCounter(): void {
  productCounter = 0;
}
