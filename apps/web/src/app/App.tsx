import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAuthInit } from '../hooks/useAuthInit';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage'));
const OrderFailedPage = lazy(() => import('../pages/OrderFailedPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AddressesPage = lazy(() => import('../pages/AddressesPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ProductGridSkeleton count={8} />
    </div>
  );
}

export default function App() {
  const { isInitializing } = useAuthInit();

  if (isInitializing) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/order-failed" element={<OrderFailedPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/addresses" element={<AddressesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
