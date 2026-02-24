import { useList, useDelete } from '@refinedev/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useDialog } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  averageRating: number;
  category?: { name: string };
}

export function ProductListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const deleteDialog = useDialog();
  const [deleteId, setDeleteId] = useState('');

  const { data, isLoading } = useList<Product>({
    resource: 'products',
    pagination: { current: page, pageSize: 10 },
    filters: search ? [{ field: 'search', operator: 'eq', value: search }] : [],
  });

  const { mutate: deleteProduct, isLoading: isDeleting } = useDelete();

  const products = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const handleDelete = () => {
    deleteProduct(
      { resource: 'products', id: deleteId },
      { onSuccess: () => deleteDialog.onClose() }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/products/create">
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
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
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {p.images[0] && (
                            <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{p.category?.name || '—'}</TableCell>
                    <TableCell>Rs. {p.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'destructive'}>
                        {p.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>★ {p.averageRating?.toFixed(1) || '0.0'}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? 'success' : 'secondary'}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/products/edit/${p._id}`}>
                          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeleteId(p._id); deleteDialog.onOpen(); }}
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
              <p className="text-sm text-gray-500">{total} total products</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Prev
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-600">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={deleteDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
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
