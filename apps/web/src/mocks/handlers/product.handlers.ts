import { http, HttpResponse } from 'msw';

const mockProducts = Array.from({ length: 8 }, (_, i) => ({
  _id: `product-${i + 1}`,
  name: `Nepali Woolen Product ${i + 1}`,
  slug: `nepali-woolen-product-${i + 1}`,
  description: `High quality handcrafted woolen product from Nepal. Item ${i + 1}.`,
  price: 2500 + i * 500,
  discountPrice: i % 3 === 0 ? 2000 + i * 400 : undefined,
  stock: 20 + i,
  images: [`https://test.com/image-${i + 1}.jpg`],
  categoryId: `category-${(i % 3) + 1}`,
  variants: [
    { size: 'M', color: 'Natural White', stock: 10 },
    { size: 'L', color: 'Grey', stock: 10 },
  ],
  averageRating: 3.5 + (i % 3) * 0.5,
  totalReviews: i * 2,
  isFeatured: i < 4,
  isActive: true,
  isDeleted: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}));

export const productHandlers = [
  http.get('/api/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || '';

    let filtered = mockProducts;
    if (search) {
      filtered = mockProducts.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      message: 'Products retrieved',
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),

  http.get('/api/v1/products/slug/:slug', ({ params }) => {
    const product = mockProducts.find((p) => p.slug === params.slug);
    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Product retrieved',
      data: product,
    });
  }),

  http.get('/api/v1/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p._id === params.id);
    if (!product) {
      return HttpResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Product retrieved',
      data: product,
    });
  }),
];
