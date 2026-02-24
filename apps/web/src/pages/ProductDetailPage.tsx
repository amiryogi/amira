import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '../hooks/useProducts';
import { useProductReviews, useCreateReview } from '../hooks/useReviews';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: productData, isLoading: productLoading } = useProductBySlug(slug!);
  const { data: reviewsData } = useProductReviews(productData?.data?._id || '', 1, { enabled: !!productData?.data?._id });
  const createReviewMutation = useCreateReview();
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const product = productData?.data;
  const reviews = reviewsData?.data || [];

  if (productLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-warm-800">Product Not Found</h2>
          <Link to="/products" className="mt-4 inline-block text-brand-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity,
      slug: product.slug,
    });
    toast.success('Added to cart');
  };

  const handleSubmitReview = () => {
    if (!reviewForm.comment.trim()) return;
    createReviewMutation.mutate(
      { product: product._id, rating: reviewForm.rating, comment: reviewForm.comment },
      {
        onSuccess: () => {
          setReviewForm({ rating: 5, comment: '' });
          setShowReviewForm(false);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-warm-500">
        <Link to="/" className="hover:text-warm-700">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-warm-700">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-warm-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xl bg-warm-100">
            <img
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 overflow-hidden rounded-lg border-2 ${
                    selectedImage === i ? 'border-brand-700' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="font-display text-3xl font-bold text-warm-800">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                <span className="text-warm-500">({product.totalReviews} reviews)</span>
              </div>
            )}
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <p className="mt-6 text-3xl font-bold text-brand-700">
            Rs. {product.price.toLocaleString()}
          </p>

          <p className="mt-6 leading-relaxed text-warm-600">{product.description}</p>

          {product.stock > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-warm-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-warm-600 hover:text-warm-800"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-warm-600 hover:text-warm-800"
                  >
                    +
                  </button>
                </div>
                <Button onClick={handleAddToCart} size="lg" className="flex-1">
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-warm-800">Reviews</h2>
          {isAuthenticated && !showReviewForm && (
            <Button variant="outline" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </Button>
          )}
        </div>

        {showReviewForm && (
          <div className="mt-6 rounded-xl bg-warm-50 p-6">
            <h3 className="font-semibold text-warm-800">Your Review</h3>
            <div className="mt-4">
              <label className="block text-sm font-medium text-warm-700">Rating</label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-warm-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-warm-700">Comment</label>
              <textarea
                rows={4}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 focus:border-brand-500 focus:outline-none"
                placeholder="Tell us about this product..."
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={handleSubmitReview} isLoading={createReviewMutation.isPending}>
                Submit Review
              </Button>
              <Button variant="ghost" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-warm-500">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((review) => {
              const r = review as { _id: string; user: { name: string }; rating: number; comment: string; createdAt: string };
              return (
                <div key={r._id} className="border-b border-warm-100 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-warm-800">{r.user?.name || 'User'}</span>
                      <div className="mt-1 text-yellow-500">
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-warm-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-3 text-warm-600">{r.comment}</p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
