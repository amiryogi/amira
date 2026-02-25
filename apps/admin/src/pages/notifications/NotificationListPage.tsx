import { useList } from '@refinedev/core';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface Notification {
  _id: string;
  type: string;
  channel: string;
  userId: string;
  user?: { name: string; email: string };
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

export function NotificationListPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useList<Notification>({
    resource: 'notifications',
    pagination: { current: page, pageSize: 15 },
    filters: [
      ...(typeFilter ? [{ field: 'type', operator: 'eq' as const, value: typeFilter }] : []),
      ...(statusFilter ? [{ field: 'status', operator: 'eq' as const, value: statusFilter }] : []),
    ],
  });

  const notifications = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 15);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>

      <div className="flex flex-wrap gap-3">
        <Select
          options={[
            { value: '', label: 'All Types' },
            { value: 'ORDER_CONFIRMATION', label: 'Order Confirmation' },
            { value: 'ORDER_STATUS', label: 'Order Status' },
            { value: 'PAYMENT_SUCCESS', label: 'Payment Success' },
            { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
            { value: 'PASSWORD_RESET', label: 'Password Reset' },
            { value: 'WELCOME', label: 'Welcome' },
          ]}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="w-48"
        />
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'SENT', label: 'Sent' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'PENDING', label: 'Pending' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-36"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">No notifications found</TableCell>
                </TableRow>
              ) : (
                notifications.map((n) => (
                  <TableRow key={n._id}>
                    <TableCell>
                      <Badge variant="secondary">{n.type?.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{n.channel}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[180px] truncate">{n.user?.name || n.userId}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[150px] truncate">{n.title}</TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">{n.message || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={n.status === 'SENT' ? 'success' : n.status === 'FAILED' ? 'destructive' : 'warning'}>
                        {n.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">{total} total</p>
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
