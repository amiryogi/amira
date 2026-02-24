import { useState } from 'react';
import { useLogin } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginPage() {
  const { mutate: login, isLoading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login(
      { email, password },
      {
        onError: (err) => {
          setError(err.message || 'Invalid credentials');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-700 text-lg font-bold text-white">
              A
            </div>
            <h1 className="text-xl font-bold text-gray-900">Amira Admin</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to the admin panel</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@amira.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
