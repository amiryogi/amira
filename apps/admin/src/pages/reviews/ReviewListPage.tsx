import { useList, useUpdate, useDelete } from '@refinedev/core';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useDialog } from '@/components/ui/dialog';
import { Check, Trash2 } from 'lucide-react';

interface Review {
  _id: string;
  user: { name: string; email: string };
  product: { name: string };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export function ReviewListPage() {
  const [page, setPage] = useState(1);
  const [approvedFilter, setApprovedFilter] = useState('');
  const deleteDialog = useDialog();
  const [deleteId, setDeleteId] = useState('');

  const { data, isLoading } = useList<Review>({
    resource: 'reviews',
    pagination: { current: page, pageSize: 10 },
    filters: approvedFilter !== '' ? [{ field: 'isApproved', operator: 'eq', value: approvedFilter }] : [],
  });

  const { mutate: updateReview } = useUpdate();
  const { mutate: deleteReview, isLoading: isDeleting } = useDelete();

  const reviews = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const handleApprove = (id: string) => {
    updateReview({ resource: 'reviews', id, values: { isApproved: true } });
  };

  const handleDelete = () => {
    deleteReview(
      { resource: 'reviews', id: deleteId },
      { onSuccess: () => deleteDialog.onClose() }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="flex gap-3">
        <Select
          options={[
            { value: '', label: 'All Reviews' },
            { value: 'true', label: 'Approved' },
            { value: 'false', label: 'Pending' },
          ]}
          value={approvedFilter}
          onChange={(e) => { setApprovedFilter(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">No reviews found</TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium text-gray-900 max-w-[150px] truncate">
                      {review.product?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{review.user?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{review.user?.email || ''}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                      {review.comment}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.isApproved ? 'success' : 'warning'}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!review.isApproved && (
                          <Button variant="ghost" size="icon" title="Approve" onClick={() => handleApprove(review._id)}>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeleteId(review._id); deleteDialog.onOpen(); }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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

      <Dialog open={deleteDialog.open} onOpenChange={deleteDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
          <DialogDescription>Are you sure? This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={deleteDialog.onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
