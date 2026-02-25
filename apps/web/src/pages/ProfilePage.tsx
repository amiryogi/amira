import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, type UpdateUserInput } from '@amira/shared/schemas';
import { useProfile } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const user = profileData;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    values: user
      ? { name: user.name, phone: user.phone || '' }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-warm-800">My Profile</h1>

      {/* Profile nav */}
      <nav className="mt-6 flex gap-4 border-b border-warm-200 pb-4">
        <span className="font-medium text-brand-700">Profile</span>
        <Link to="/profile/addresses" className="text-warm-500 hover:text-warm-700">
          Addresses
        </Link>
        <Link to="/orders" className="text-warm-500 hover:text-warm-700">
          Orders
        </Link>
      </nav>

      <form
        onSubmit={handleSubmit((data) => updateMutation.mutate(data))}
        className="mt-8 space-y-5"
      >
        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          disabled
          className="bg-warm-50"
        />

        <Input
          label="Full Name"
          type="text"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Phone"
          type="tel"
          placeholder="+977 98XXXXXXXX"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="flex items-center gap-3">
          <span className="text-sm text-warm-500">Role:</span>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
            {user?.role}
          </span>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={!isDirty}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
