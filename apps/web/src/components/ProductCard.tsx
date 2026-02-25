import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    averageRating: number;
    totalReviews: number;
    stock?: number;
  };
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(function ProductCard({ product }) {
  const outOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-warm-100">
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {/* Quick view hint */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
          <span className="flex items-center justify-center gap-1.5 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-medium text-warm-800 shadow-lg backdrop-blur-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Quick View
          </span>
        </div>
        {/* Out of stock badge */}
        {outOfStock && (
          <div className="absolute right-2 top-2 rounded-lg bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Sold Out
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-2 text-sm font-medium text-warm-800 transition-colors group-hover:text-brand-700 sm:text-base">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-brand-700 sm:text-lg">
            Rs. {product.price.toLocaleString()}
          </span>
        </div>
        {product.totalReviews > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.averageRating) ? 'text-amber-400' : 'text-warm-200'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-warm-400">({product.totalReviews})</span>
          </div>
        )}
      </div>
    </Link>
  );
});
