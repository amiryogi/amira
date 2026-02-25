import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, limit: 8 });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const products = productsData?.data || [];
  const categories = categoriesData || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-brand-800 via-brand-900 to-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-200 backdrop-blur-sm sm:text-sm">
              Authentic Nepali Craftsmanship
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              Handcrafted Woolen Treasures from Nepal
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-200/90 sm:mt-6 sm:text-lg">
              Discover authentic handmade woolen products crafted with love by Nepali artisans.
              Each piece tells a story of tradition and craftsmanship.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
              <Link to="/products">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products?category=new-arrivals">
                <Button variant="outline" size="lg" className="w-full border-white/30 text-white hover:bg-white/10 sm:w-auto">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 hidden h-80 w-80 rounded-full bg-brand-700/30 blur-3xl sm:block" />
        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-brand-600/20 blur-3xl sm:right-40 sm:h-60 sm:w-60" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="font-display text-xl font-bold text-warm-800 sm:text-2xl lg:text-3xl">
          Shop by Category
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-warm-100 sm:h-32" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="group flex items-center justify-center rounded-2xl border border-warm-100 bg-white p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:shadow-md sm:p-6"
                >
                  <span className="text-sm font-medium text-warm-700 transition-colors group-hover:text-brand-700 sm:text-base">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-warm-800 sm:text-2xl lg:text-3xl">
            Featured Products
          </h2>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800">
            View All
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 gap-y-6 sm:mt-8 sm:gap-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {productsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-linear-to-b from-warm-50 to-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center font-display text-xl font-bold text-warm-800 sm:mb-12 sm:text-2xl lg:text-3xl">
            Why Choose Amira Nepal?
          </h2>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl shadow-sm">
                🧶
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-warm-800 sm:text-lg">
                Handcrafted
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-500">
                Every piece is hand-knitted by skilled Nepali artisans using traditional techniques.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl shadow-sm">
                🏔️
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-warm-800 sm:text-lg">
                100% Nepali Wool
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-500">
                Sourced from the highlands of Nepal, our wool is naturally warm and durable.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl shadow-sm">
                💚
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-warm-800 sm:text-lg">
                Fair Trade
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-500">
                We ensure fair wages and sustainable practices for every artisan we work with.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
