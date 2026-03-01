import { Refine, Authenticated } from '@refinedev/core';
import routerProvider, {
  NavigateToResource,
  CatchAllNavigate,
} from '@refinedev/react-router';
import { Routes, Route, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  Bell,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

import { authProvider } from '@/providers/authProvider';
import { dataProvider } from '@/providers/dataProvider';

import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductListPage } from '@/pages/products/ProductListPage';
import { ProductFormPage } from '@/pages/products/ProductFormPage';
import { CategoryListPage } from '@/pages/categories/CategoryListPage';
import { OrderListPage } from '@/pages/orders/OrderListPage';
import { OrderShowPage } from '@/pages/orders/OrderShowPage';
import { PaymentListPage } from '@/pages/payments/PaymentListPage';
import { UserListPage } from '@/pages/users/UserListPage';
import { ReviewListPage } from '@/pages/reviews/ReviewListPage';
import { NotificationListPage } from '@/pages/notifications/NotificationListPage';
import { ChatListPage } from '@/pages/chat/ChatListPage';
import { ChatRoomPage } from '@/pages/chat/ChatRoomPage';

export default function App() {
  return (
    <Refine
      routerProvider={routerProvider}
      authProvider={authProvider}
      dataProvider={dataProvider}
      resources={[
        {
          name: 'dashboard',
          list: '/',
          meta: { label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        },
        {
          name: 'products',
          list: '/products',
          create: '/products/create',
          edit: '/products/:id/edit',
          meta: { label: 'Products', icon: <Package size={18} /> },
        },
        {
          name: 'categories',
          list: '/categories',
          meta: { label: 'Categories', icon: <FolderTree size={18} /> },
        },
        {
          name: 'orders',
          list: '/orders',
          show: '/orders/:id',
          meta: { label: 'Orders', icon: <ShoppingCart size={18} /> },
        },
        {
          name: 'payments',
          list: '/payments',
          meta: { label: 'Payments', icon: <CreditCard size={18} /> },
        },
        {
          name: 'users',
          list: '/users',
          meta: { label: 'Users', icon: <Users size={18} /> },
        },
        {
          name: 'reviews',
          list: '/reviews',
          meta: { label: 'Reviews', icon: <Star size={18} /> },
        },
        {
          name: 'notifications',
          list: '/notifications',
          meta: { label: 'Notifications', icon: <Bell size={18} /> },
        },
        {
          name: 'chat',
          list: '/chat',
          show: '/chat/:id',
          meta: { label: 'Chat', icon: <MessageSquare size={18} /> },
        },
        {
          name: 'analytics',
          list: '/analytics',
          meta: { label: 'Analytics', icon: <BarChart3 size={18} /> },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
      }}
    >
      <Routes>
        {/* Authenticated routes */}
        <Route
          element={
            <Authenticated key="auth" fallback={<CatchAllNavigate to="/login" />}>
              <AdminLayout />
            </Authenticated>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* Products */}
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/create" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />

          {/* Categories */}
          <Route path="/categories" element={<CategoryListPage />} />

          {/* Orders */}
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id" element={<OrderShowPage />} />

          {/* Payments */}
          <Route path="/payments" element={<PaymentListPage />} />

          {/* Users */}
          <Route path="/users" element={<UserListPage />} />

          {/* Reviews */}
          <Route path="/reviews" element={<ReviewListPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationListPage />} />

          {/* Chat */}
          <Route path="/chat" element={<ChatListPage />} />
          <Route path="/chat/:id" element={<ChatRoomPage />} />

          {/* Analytics — reuses DashboardPage (full analytics) */}
          <Route path="/analytics" element={<DashboardPage />} />
        </Route>

        {/* Login */}
        <Route
          element={
            <Authenticated key="no-auth" fallback={<Outlet />}>
              <NavigateToResource resource="dashboard" />
            </Authenticated>
          }
        >
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NavigateToResource resource="dashboard" />} />
      </Routes>
    </Refine>
  );
}
