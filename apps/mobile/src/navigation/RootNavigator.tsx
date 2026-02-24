import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { AuthStack } from './AuthStack';
import { UserStack } from './UserStack';
import { AdminStack } from './AdminStack';
import { UserRole } from '@amira/shared';

export function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <AuthStack />;
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminStack />;
  }

  return <UserStack />;
}
