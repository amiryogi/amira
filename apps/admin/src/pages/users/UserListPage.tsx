import { useList, useUpdate, useDelete } from '@refinedev/core';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useDialog } from '@/components/ui/dialog';
import { Search, Trash2, Shield } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export function UserListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const deleteDialog = useDialog();
  const roleDialog = useDialog();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const { data, isLoading } = useList<User>({
    resource: 'users',
    pagination: { current: page, pageSize: 10 },
    filters: [
      ...(search ? [{ field: 'search', operator: 'eq' as const, value: search }] : []),
      ...(roleFilter ? [{ field: 'role', operator: 'eq' as const, value: roleFilter }] : []),
    ],
  });

  const { mutate: deleteUser, isLoading: isDeleting } = useDelete();
  const { mutate: updateUser, isLoading: isUpdating } = useUpdate();

  const users = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUser(
      { resource: 'users', id: selectedUser._id },
      { onSuccess: () => { deleteDialog.onClose(); setSelectedUser(null); } }
    );
  };

  const handleRoleUpdate = () => {
    if (!selectedUser || !newRole) return;
    updateUser(
      { resource: 'users', id: selectedUser._id, values: { role: newRole } },
      { onSuccess: () => { roleDialog.onClose(); setSelectedUser(null); } }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-64"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Roles' },
            { value: 'USER', label: 'User' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="w-36"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">No users found</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium text-gray-900">{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell className="text-gray-500">{user.phone || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isVerified !== false ? 'success' : 'destructive'}>
                        {user.isVerified !== false ? 'Verified' : 'Unverified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Change role"
                          onClick={() => { setSelectedUser(user); setNewRole(user.role); roleDialog.onOpen(); }}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedUser(user); deleteDialog.onOpen(); }}
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
              <p className="text-sm text-gray-500">{total} total users</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <span className="flex items-center px-3 text-sm text-gray-600">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role change dialog */}
      <Dialog open={roleDialog.open} onOpenChange={roleDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update role for <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Select
            label="Role"
            options={[
              { value: 'USER', label: 'User' },
              { value: 'ADMIN', label: 'Admin' },
            ]}
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={roleDialog.onClose}>Cancel</Button>
          <Button onClick={handleRoleUpdate} isLoading={isUpdating}>Update Role</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={deleteDialog.onOpenChange}>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This is a soft delete.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={deleteDialog.onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={isDeleting}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
