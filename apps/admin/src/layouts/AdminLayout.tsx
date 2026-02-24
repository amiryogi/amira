import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useGetIdentity, useLogout } from '@refinedev/core';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Categories', path: '/categories', icon: FolderTree },
  { label: 'Orders', path: '/orders', icon: ShoppingCart },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Reviews', path: '/reviews', icon: Star },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { data: identity } = useGetIdentity<{ name: string; email: string }>();
  const { mutate: logout } = useLogout();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-sm font-bold text-white">
              A
            </div>
            <span className="text-lg font-bold text-gray-900">Amira Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div className="hidden text-sm text-gray-500 lg:block">
            {navItems.find(
              (i) =>
                i.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(i.path)
            )?.label || 'Admin'}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                {identity?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className="hidden sm:block">{identity?.name || 'Admin'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{identity?.name}</p>
                  <p className="text-xs text-gray-500">{identity?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
