import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function OrderSuccessPage() {
  const location = useLocation();
  const orderId = (location.state as { orderId?: string })?.orderId;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
          ✓
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-warm-800">
          Order Placed Successfully!
        </h1>
        <p className="mt-3 text-warm-500">
          Thank you for your purchase. We&apos;ll send you an email confirmation shortly.
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-warm-400">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {orderId && (
            <Link to={`/orders/${orderId}`}>
              <Button variant="outline">View Order</Button>
            </Link>
          )}
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
