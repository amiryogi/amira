import { useList, useDelete, useCreate, useUpdate } from '@refinedev/core';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useDialog } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export function CategoryListPage() {
  const [page, setPage] = useState(1);
  const deleteDialog = useDialog();
  const formDialog = useDialog();
  const [deleteId, setDeleteId] = useState('');
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');

  const { data, isLoading } = useList<Category>({
    resource: 'categories',
    pagination: { current: page, pageSize: 20 },
  });

  const { mutate: deleteCategory, isLoading: isDeleting } = useDelete();
  const { mutate: createCategory, isLoading: isCreating } = useCreate();
  const { mutate: updateCategory, isLoading: isUpdating } = useUpdate();

  const categories = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const handleDelete = () => {
    deleteCategory(
      { resource: 'categories', id: deleteId },
      { onSuccess: () => deleteDialog.onClose() }
    );
  };

  const openCreate = () => {
    setEditCategory(null);
    setFormName('');
    formDialog.onOpen();
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setFormName(cat.name);
    formDialog.onOpen();
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    if (editCategory) {
      updateCategory(
        { resource: 'categories', id: editCategory._id, values: { name: formName } },
        { onSuccess: () => formDialog.onClose() }
      );
    } else {
      createCategory(
        { resource: 'categories', values: { name: formName } },
        { onSuccess: () => formDialog.onClose() }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell className="font-medium text-gray-900">{cat.name}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-500">{cat.slug}</TableCell>
                    <TableCell>
                      <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeleteId(cat._id); deleteDialog.onOpen(); }}
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

      {/* Create / Edit dialog */}
      <Dialog open={formDialog.open} onOpenChange={formDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>{editCategory ? 'Edit' : 'Create'} Category</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            label="Category Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Shawls"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={formDialog.onClose}>Cancel</Button>
          <Button onClick={handleSave} isLoading={isCreating || isUpdating}>
            {editCategory ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={deleteDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
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
