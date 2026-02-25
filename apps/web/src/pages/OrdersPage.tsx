import { Link } from 'react-router-dom';
import { useUserOrders } from '../hooks/useOrders';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Pagination } from '../components/ui/Pagination';
import { useState } from 'react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data: ordersData, isLoading } = useUserOrders(page);

  const orders = ordersData?.data || [];
  const pagination = ordersData?.pagination;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">My Orders</h1>

      <nav className="mt-6 flex gap-4 border-b border-warm-200 pb-4">
        <Link to="/profile" className="text-warm-500 hover:text-warm-700">
          Profile
        </Link>
        <Link to="/profile/addresses" className="text-warm-500 hover:text-warm-700">
          Addresses
        </Link>
        <span className="font-medium text-brand-700">Orders</span>
      </nav>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Start shopping to see your orders here."
            action={
              <Link to="/products">
                <Button>Browse Products</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => {
                const o = order as {
                  _id: string;
                  totalAmount: number;
                  orderStatus: string;
                  paymentMethod: string;
                  products: { productId: string; name: string; image?: string; quantity: number; price: number }[];
                  createdAt: string;
                };
                return (
                  <Link
                    key={o._id}
                    to={`/orders/${o._id}`}
                    className="block rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-warm-400">
                          {new Date(o.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="mt-1 font-mono text-xs text-warm-400">
                          #{o._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.orderStatus] || 'bg-warm-100 text-warm-700'}`}
                      >
                        {o.orderStatus}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {o.products.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className="h-12 w-12 overflow-hidden rounded-lg bg-warm-100"
                        >
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                      {o.products.length > 3 && (
                        <span className="text-sm text-warm-400">
                          +{o.products.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-warm-500">
                        {o.products.length} item{o.products.length > 1 ? 's' : ''} · {o.paymentMethod}
                      </span>
                      <span className="font-semibold text-warm-800">
                        Rs. {o.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
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
  );
}
