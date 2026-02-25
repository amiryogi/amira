import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCard } from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const categorySlug = searchParams.get('category') || '';
  const searchTerm = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : undefined;

  const { data: productsData, isLoading } = useProducts({
    page,
    limit: 12,
    categoryId: selectedCategory?._id || undefined,
    search: searchTerm || undefined,
    sort: sort || undefined,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
  });

  const products = productsData?.data || [];
  const pagination = productsData?.pagination;

  // Lock body scroll when filter drawer is open on mobile
  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceRange({ min: '', max: '' });
    setFiltersOpen(false);
  };

  const activeFilterCount = [categorySlug, priceRange.min, priceRange.max, sort].filter(Boolean).length;

  // Shared filter content (reused in sidebar and mobile drawer)
  const filterContent = (
    <>
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-500">Category</h3>
        <div className="mt-3 space-y-1">
          <button
            onClick={() => setCategory('')}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              !categorySlug
                ? 'bg-brand-50 font-medium text-brand-700'
                : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setCategory(cat.slug)}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                categorySlug === cat.slug
                  ? 'bg-brand-50 font-medium text-brand-700'
                  : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-500">Price Range</h3>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-warm-400">Rs.</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange((p) => ({ ...p, min: e.target.value }))}
              className="w-full rounded-xl border border-warm-200 bg-warm-50/50 py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <span className="flex items-center text-warm-300">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-warm-400">Rs.</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange((p) => ({ ...p, max: e.target.value }))}
              className="w-full rounded-xl border border-warm-200 bg-warm-50/50 py-2.5 pl-9 pr-3 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-500">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="mt-3 w-full appearance-none rounded-xl border border-warm-200 bg-warm-50/50 px-3 py-2.5 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-warm-200 px-4 py-2.5 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-warm-800 sm:text-3xl">
            {searchTerm ? `Results for "${searchTerm}"` : selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          {pagination && (
            <p className="mt-1 text-sm text-warm-400">
              {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-warm-200 bg-white px-4 py-2.5 text-sm font-medium text-warm-700 shadow-sm transition-colors hover:bg-warm-50 lg:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active filter chips (mobile) */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
          {categorySlug && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              {selectedCategory?.name || categorySlug}
              <button onClick={() => setCategory('')} className="hover:text-brand-900">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
          {sort && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700">
              Sorted
              <button onClick={() => setSort('')} className="hover:text-brand-900">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          )}
        </div>
      )}

      <div className="mt-6 flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-warm-100 bg-white p-5 shadow-sm">
            {filterContent}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 sm:gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              icon={
                <svg className="mx-auto h-16 w-16 text-warm-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              action={
                <button
                  onClick={clearFilters}
                  className="mt-2 rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
                >
                  Clear Filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 gap-y-6 sm:gap-4 sm:gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10">
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

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-warm-800">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-warm-500 hover:bg-warm-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {filterContent}
            </div>
            {/* Footer */}
            <div className="border-t border-warm-100 p-5 safe-bottom">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
