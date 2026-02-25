import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useLogout } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { searchService } from '@/services/search.service';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const logout = useLogout();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchService.suggest(debouncedSearch).then(({ data }) => {
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Close suggestions on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-warm-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-warm-700 hover:bg-warm-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold text-brand-700">
          Amira
        </Link>

        {/* Desktop Search */}
        <div ref={searchRef} className="relative hidden flex-1 px-8 md:block">
          <form onSubmit={handleSearch}>
            <div className="relative max-w-lg mx-auto">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search woolen products..."
                className="w-full rounded-full border border-warm-200 bg-warm-50/80 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-8 right-8 top-full z-50 mx-auto mt-1 max-w-lg overflow-hidden rounded-xl border border-warm-200 bg-white shadow-xl">
              {suggestions.map((s) => (
                <Link
                  key={s._id}
                  to={`/products/${s.slug}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-warm-700 transition-colors hover:bg-warm-50"
                  onClick={() => setShowSuggestions(false)}
                >
                  <svg className="h-4 w-4 shrink-0 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/products" className="rounded-lg px-3 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-brand-700">
            Shop
          </Link>
          <Link to="/cart" className="relative rounded-lg px-3 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-brand-700">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="rounded-lg px-3 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-brand-700">
                Orders
              </Link>
              <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:text-brand-700">
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="ml-1 rounded-lg px-3 py-2 text-sm font-medium text-warm-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile right icons: Search + Cart */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-warm-700 hover:bg-warm-100"
            aria-label="Search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-warm-700 hover:bg-warm-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>

      {/* Mobile Search Bar (slide down) — outside header to avoid backdrop-filter containing block */}
      {mobileSearchOpen && (
        <div className="sticky top-[57px] z-50 border-b border-warm-100 bg-white px-4 py-3 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-warm-200 bg-warm-50 py-3 pl-10 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoFocus
              />
            </div>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 overflow-hidden rounded-xl border border-warm-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <Link
                  key={s._id}
                  to={`/products/${s.slug}`}
                  className="block px-4 py-3 text-sm text-warm-700 transition-colors hover:bg-warm-50"
                  onClick={() => { setShowSuggestions(false); setMobileSearchOpen(false); }}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay — outside header to avoid backdrop-filter containing block */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-[60] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeMobileMenu} />
          {/* Menu panel */}
          <nav className="relative flex h-full max-h-[calc(100vh-57px)] w-72 flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex flex-col p-4">
              {isAuthenticated && (
                <div className="mb-4 rounded-xl bg-warm-50 p-4">
                  <p className="font-medium text-warm-800">Hi, {user?.name?.split(' ')[0] || 'there'}!</p>
                  <p className="mt-0.5 text-sm text-warm-500">{user?.email}</p>
                </div>
              )}

              <Link onClick={closeMobileMenu} to="/products" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-warm-700 transition-colors hover:bg-warm-50">
                <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Shop
              </Link>
              <Link onClick={closeMobileMenu} to="/cart" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-warm-700 transition-colors hover:bg-warm-50">
                <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Cart
                {itemCount > 0 && (
                  <span className="ml-auto rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {itemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated && (
                <>
                  <Link onClick={closeMobileMenu} to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-warm-700 transition-colors hover:bg-warm-50">
                    <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Orders
                  </Link>
                  <Link onClick={closeMobileMenu} to="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-warm-700 transition-colors hover:bg-warm-50">
                    <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link onClick={closeMobileMenu} to="/addresses" className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-warm-700 transition-colors hover:bg-warm-50">
                    <svg className="h-5 w-5 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Addresses
                  </Link>
                </>
              )}
            </div>

            {/* Bottom section */}
            <div className="mt-auto border-t border-warm-100 p-4">
              {isAuthenticated ? (
                <button
                  onClick={() => { logout.mutate(); closeMobileMenu(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-brand-800"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
