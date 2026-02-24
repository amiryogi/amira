import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@amira/shared/schemas';
import { useRegister } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, {
      onSuccess: () => navigate('/login'),
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-center font-display text-3xl font-bold text-warm-800">
            Create Account
          </h1>
          <p className="mt-2 text-center text-warm-500">
            Join Amira for handcrafted woolen goods
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your full name"
              error={errors.name?.message}
              {...formRegister('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...formRegister('email')}
            />

            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+977 98XXXXXXXX"
              error={errors.phone?.message}
              {...formRegister('phone')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                error={errors.password?.message}
                {...formRegister('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-sm text-warm-500 hover:text-warm-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                error={errors.confirmPassword?.message}
                {...formRegister('confirmPassword')}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={registerMutation.isPending}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
