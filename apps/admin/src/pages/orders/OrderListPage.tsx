import { useList, useUpdate } from '@refinedev/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, Search } from 'lucide-react';

const statusVariant: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  SHIPPED: 'purple',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
};

const paymentStatusVariant: Record<string, 'warning' | 'success' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
};

interface Order {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  products: unknown[];
  createdAt: string;
}

export function OrderListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useList<Order>({
    resource: 'orders',
    pagination: { current: page, pageSize: 10 },
    filters: [
      ...(statusFilter ? [{ field: 'orderStatus', operator: 'eq' as const, value: statusFilter }] : []),
      ...(search ? [{ field: 'search', operator: 'eq' as const, value: search }] : []),
    ],
  });

  const orders = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const exportCSV = () => {
    const headers = 'Order ID,User,Total,Payment Method,Payment Status,Order Status,Date\n';
    const rows = orders
      .map((o) =>
        `${o._id},${o.user?.email || ''},${o.totalAmount},${o.paymentMethod},${o.paymentStatus},${o.orderStatus},${new Date(o.createdAt).toLocaleDateString()}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by email or ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Pay Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">Rs. {order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusVariant[order.paymentStatus] || 'secondary'}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.orderStatus] || 'secondary'}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/orders/${order._id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">{total} total orders</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <span className="flex items-center px-3 text-sm text-gray-600">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
