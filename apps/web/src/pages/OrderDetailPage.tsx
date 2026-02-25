import { useParams, Link } from 'react-router-dom';
import { useOrderById } from '../hooks/useOrders';
import { Skeleton } from '../components/ui/Skeleton';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: orderData, isLoading } = useOrderById(id!);

  const order = orderData as Record<string, unknown> | undefined;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-warm-800">Order Not Found</h2>
          <Link to="/orders" className="mt-4 inline-block text-brand-700">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const o = order as {
    _id: string;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    totalAmount: number;
    products: { productId: string; name: string; image?: string; quantity: number; price: number }[];
    deliveryAddress: { label: string; fullName: string; street: string; city: string; district: string; province: string; postalCode?: string; phone: string };
    createdAt: string;
    updatedAt: string;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-warm-400 hover:text-warm-600">
          ← Orders
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-warm-800">
            Order #{o._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-warm-400">
            Placed on{' '}
            {new Date(o.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${statusColors[o.orderStatus] || 'bg-warm-100 text-warm-700'}`}
        >
          {o.orderStatus}
        </span>
      </div>

      {/* Items */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-warm-800">Items</h2>
        <div className="mt-4 divide-y divide-warm-100">
          {o.products.map((item, i) => (
            <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-warm-100">
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <span className="font-medium text-warm-800">
                    {item.name}
                  </span>
                  <p className="text-sm text-warm-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-medium text-warm-800">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Shipping */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-warm-800">Delivery Address</h2>
          {o.deliveryAddress && (
            <div className="mt-3 text-sm text-warm-600">
              <p className="font-medium text-warm-700">{o.deliveryAddress.label}</p>
              <p>{o.deliveryAddress.fullName}</p>
              <p>{o.deliveryAddress.street}</p>
              <p>
                {o.deliveryAddress.city}, {o.deliveryAddress.district},{' '}
                {o.deliveryAddress.province}{' '}
                {o.deliveryAddress.postalCode}
              </p>
              <p>{o.deliveryAddress.phone}</p>
            </div>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-warm-800">Payment</h2>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-500">Method</span>
              <span className="text-warm-800">{o.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-warm-500">Status</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[o.paymentStatus] || 'bg-warm-100 text-warm-700'}`}
              >
                {o.paymentStatus}
              </span>
            </div>
            <div className="border-t border-warm-100 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-warm-800">Total</span>
                <span className="text-brand-700">Rs. {o.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
