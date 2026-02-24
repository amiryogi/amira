import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAddressSchema, type CreateAddressInput } from '@amira/shared/schemas';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '../hooks/useAddresses';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function AddressesPage() {
  const { data: addressesData, isLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addresses = addressesData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAddressInput>({
    resolver: zodResolver(createAddressSchema),
  });

  const onSubmit = (data: CreateAddressInput) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            setEditingId(null);
            setShowForm(false);
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
          reset();
        },
      });
    }
  };

  const handleEdit = (addr: Record<string, unknown>) => {
    const a = addr as { _id: string; label: string; street: string; city: string; state: string; postalCode: string; phone: string };
    setEditingId(a._id);
    reset({
      label: a.label,
      street: a.street,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      phone: a.phone,
    });
    setShowForm(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">My Addresses</h1>

      <nav className="mt-6 flex gap-4 border-b border-warm-200 pb-4">
        <Link to="/profile" className="text-warm-500 hover:text-warm-700">
          Profile
        </Link>
        <span className="font-medium text-brand-700">Addresses</span>
        <Link to="/orders" className="text-warm-500 hover:text-warm-700">
          Orders
        </Link>
      </nav>

      <div className="mt-8">
        {!showForm && (
          <Button variant="outline" onClick={() => { setEditingId(null); reset({}); setShowForm(true); }}>
            + Add New Address
          </Button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 rounded-xl bg-warm-50 p-6 space-y-4">
            <h3 className="font-semibold text-warm-800">
              {editingId ? 'Edit Address' : 'New Address'}
            </h3>
            <Input label="Label" placeholder="Home, Office, etc." error={errors.label?.message} {...register('label')} />
            <Input label="Street" placeholder="Street address" error={errors.street?.message} {...register('street')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" error={errors.city?.message} {...register('city')} />
              <Input label="State / Province" error={errors.state?.message} {...register('state')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Postal Code" error={errors.postalCode?.message} {...register('postalCode')} />
              <Input label="Phone" placeholder="+977..." error={errors.phone?.message} {...register('phone')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setShowForm(false); setEditingId(null); reset(); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))
          ) : addresses.length === 0 ? (
            <EmptyState title="No addresses" description="Add a shipping address to get started." />
          ) : (
            addresses.map((addr) => {
              const a = addr as { _id: string; label: string; street: string; city: string; state: string; postalCode: string; phone: string; isDefault: boolean };
              return (
                <div key={a._id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-warm-800">{a.label}</span>
                      {a.isDefault && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-warm-500">
                      {a.street}, {a.city}, {a.state} {a.postalCode}
                    </p>
                    <p className="text-sm text-warm-500">{a.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {!a.isDefault && (
                      <button
                        onClick={() => setDefaultMutation.mutate(a._id)}
                        className="text-xs text-brand-700 hover:text-brand-800"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(a as never)}
                      className="text-xs text-warm-500 hover:text-warm-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(a._id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
