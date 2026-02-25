import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@amira/shared/schemas';
import type { ForgotPasswordInput } from '@amira/shared';
import { useForgotPassword } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const forgotMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotMutation.mutate(data);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-center font-display text-3xl font-bold text-warm-800">
            Forgot Password
          </h1>
          <p className="mt-2 text-center text-warm-500">
            Enter your email and we&apos;ll send you a reset link
          </p>

          {forgotMutation.isSuccess ? (
            <div className="mt-8 rounded-lg bg-green-50 p-4 text-center text-green-700">
              <p className="font-medium">Check your email!</p>
              <p className="mt-1 text-sm">
                If an account exists with that email, you will receive a password
                reset link shortly.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={forgotMutation.isPending}
              >
                Send Reset Link
              </Button>

              <p className="text-center text-sm text-warm-500">
                <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
