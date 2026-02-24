import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cart.store';
import { useAuthStore } from '../store/auth.store';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any products yet."
          action={
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-xl bg-white p-4 shadow-sm"
              >
                <Link to={`/products/${item.slug}`} className="shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-warm-100">
                    <img
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to={`/products/${item.slug}`}
                      className="font-medium text-warm-800 hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 font-semibold text-brand-700">
                      Rs. {item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-warm-200">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                        }
                        className="px-3 py-1 text-warm-600 hover:text-warm-800"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-3 py-1 text-warm-600 hover:text-warm-800"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={clearCart}
            className="mt-4 text-sm text-warm-500 hover:text-red-600"
          >
            Clear cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-warm-800">Order Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-warm-600">
              <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span>Rs. {getTotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-warm-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t border-warm-100 pt-3">
              <div className="flex justify-between text-lg font-semibold text-warm-800">
                <span>Total</span>
                <span>Rs. {getTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            {isAuthenticated ? (
              <Link to="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            ) : (
              <Link to="/login" state={{ from: { pathname: '/cart' } }}>
                <Button className="w-full" size="lg">
                  Login to Checkout
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
