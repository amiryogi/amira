import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

function ProductCard({ product }: { product: { _id: string; name: string; slug: string; price: number; images: string[]; averageRating: number; totalReviews: number } }) {
  return (
    <Link to={`/products/${product.slug}`} className="group">
      <div className="aspect-square overflow-hidden rounded-xl bg-warm-100">
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-3">
        <h3 className="font-medium text-warm-800 group-hover:text-brand-700 transition-colors">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-brand-700">Rs. {product.price.toLocaleString()}</span>
          {product.totalReviews > 0 && (
            <span className="text-sm text-warm-500">
              ★ {product.averageRating.toFixed(1)} ({product.totalReviews})
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, limit: 8 });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 to-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Handcrafted Woolen Treasures from Nepal
            </h1>
            <p className="mt-6 text-lg text-brand-200">
              Discover authentic handmade woolen products crafted with love by Nepali artisans.
              Each piece tells a story of tradition and craftsmanship.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products">
                <Button variant="secondary" size="lg">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products?category=new-arrivals">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  New Arrivals
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-700/30 blur-3xl" />
        <div className="absolute -bottom-20 right-40 h-60 w-60 rounded-full bg-brand-600/20 blur-3xl" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-warm-800 sm:text-3xl">
          Shop by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categoriesLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-warm-100" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="group flex items-center justify-center rounded-xl bg-warm-50 p-6 text-center transition-all hover:bg-brand-50 hover:shadow-md"
                >
                  <span className="font-medium text-warm-700 group-hover:text-brand-700">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-warm-800 sm:text-3xl">
            Featured Products
          </h2>
          <Link to="/products" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            View All →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 gap-y-8">
          {productsLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => (
                <ProductCard key={product._id} product={product as never} />
              ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-warm-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                🧶
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-warm-800">
                Handcrafted
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Every piece is hand-knitted by skilled Nepali artisans using traditional techniques.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                🏔️
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-warm-800">
                100% Nepali Wool
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                Sourced from the highlands of Nepal, our wool is naturally warm and durable.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
                💚
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-warm-800">
                Fair Trade
              </h3>
              <p className="mt-2 text-sm text-warm-500">
                We ensure fair wages and sustainable practices for every artisan we work with.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
