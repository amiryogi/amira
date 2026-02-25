import { useParams, useNavigate } from 'react-router-dom';
import { useOne, useUpdate } from '@refinedev/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

const statusVariant: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'purple',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
};

interface OrderDetail {
  _id: string;
  user: { name: string; email: string; phone?: string };
  products: { productId: string; name: string; quantity: number; price: number; image?: string }[];
  deliveryAddress: { label: string; fullName: string; street: string; city: string; district: string; province: string; postalCode?: string; phone: string };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
}

export function OrderShowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useOne<OrderDetail>({ resource: 'orders', id: id! });
  const { mutate: updateOrder, isLoading: isUpdating } = useUpdate();

  const order = data?.data as OrderDetail | undefined;
  const [newStatus, setNewStatus] = useState('');

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    updateOrder(
      { resource: 'orders', id: id!, values: { orderStatus: newStatus } },
      { onSuccess: () => setNewStatus('') }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-700" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-gray-500">Order not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => navigate('/orders')}>← Back</Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <Badge variant={statusVariant[order.orderStatus]}>{order.orderStatus}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Items ({order.products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100">
              {order.products.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.image && (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-medium">Rs. {(item.quantity * item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4 text-right">
              <span className="text-lg font-bold text-gray-900">
                Total: Rs. {order.totalAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'CONFIRMED', label: 'Confirmed' },
                  { value: 'SHIPPED', label: 'Shipped' },
                  { value: 'DELIVERED', label: 'Delivered' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={newStatus || order.orderStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleStatusUpdate}
                disabled={!newStatus || newStatus === order.orderStatus}
                isLoading={isUpdating}
              >
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium text-gray-900">{order.user?.name}</p>
              <p className="text-gray-500">{order.user?.email}</p>
              {order.user?.phone && <p className="text-gray-500">{order.user?.phone}</p>}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : order.paymentStatus === 'FAILED' ? 'destructive' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <Card>
              <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{order.deliveryAddress.label}</p>
                <p>{order.deliveryAddress.fullName}</p>
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.city}, {order.deliveryAddress.district}, {order.deliveryAddress.province} {order.deliveryAddress.postalCode}</p>
                <p>{order.deliveryAddress.phone}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span>{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
