import { useList } from '@refinedev/core';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Payment {
  _id: string;
  order: string;
  transactionId: string;
  amount: number;
  method: string;
  status: string;
  verifiedAt?: string;
  createdAt: string;
}

export function PaymentListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useList<Payment>({
    resource: 'payments',
    pagination: { current: page, pageSize: 10 },
    filters: [
      ...(statusFilter ? [{ field: 'status', operator: 'eq' as const, value: statusFilter }] : []),
      ...(search ? [{ field: 'search', operator: 'eq' as const, value: search }] : []),
    ],
  });

  const payments = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const exportCSV = () => {
    const headers = 'Transaction ID,Order ID,Amount,Method,Status,Date\n';
    const rows = payments
      .map((p) =>
        `${p.transactionId},${p.order},${p.amount},${p.method},${p.status},${new Date(p.createdAt).toLocaleDateString()}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by transaction ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'PAID', label: 'Paid' },
            { value: 'FAILED', label: 'Failed' },
            { value: 'REFUNDED', label: 'Refunded' },
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
                <TableHead>Transaction ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-xs">{p.transactionId || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      #{(typeof p.order === 'string' ? p.order : '').slice(-8).toUpperCase()}
                    </TableCell>
                    <TableCell className="font-medium">Rs. {p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'PAID' ? 'success' : p.status === 'FAILED' ? 'destructive' : 'warning'}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {p.verifiedAt ? new Date(p.verifiedAt).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
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
