import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';

function ProductCard({ product }: { product: Record<string, unknown> }) {
  const p = product as { _id: string; name: string; slug: string; price: number; images: string[]; averageRating: number; totalReviews: number };
  return (
    <Link to={`/products/${p.slug}`} className="group">
      <div className="aspect-square overflow-hidden rounded-xl bg-warm-100">
        <img
          src={p.images[0] || '/placeholder.jpg'}
          alt={p.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-warm-800 group-hover:text-brand-700 transition-colors line-clamp-2">
          {p.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-brand-700">Rs. {p.price.toLocaleString()}</span>
          {p.totalReviews > 0 && (
            <span className="text-sm text-warm-500">
              ★ {p.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const categorySlug = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading } = useProducts({
    page,
    limit: 12,
    category: categorySlug || undefined,
    sort: sort || undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
  });

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;
  const categories = categoriesData?.data || [];

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    setSearchParams(params);
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">Products</h1>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full shrink-0 lg:w-56">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-warm-800">Categories</h3>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setCategory('')}
                className={`block w-full text-left text-sm ${!categorySlug ? 'font-medium text-brand-700' : 'text-warm-600 hover:text-warm-800'}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setCategory(cat.slug)}
                  className={`block w-full text-left text-sm ${categorySlug === cat.slug ? 'font-medium text-brand-700' : 'text-warm-600 hover:text-warm-800'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6">
            <h3 className="font-semibold text-warm-800">Price Range</h3>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mt-6">
            <h3 className="font-semibold text-warm-800">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-3 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 gap-y-8 sm:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product as never} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
