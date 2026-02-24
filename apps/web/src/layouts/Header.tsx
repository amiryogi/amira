import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import { useLogout } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { searchService } from '@/services/search.service';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const logout = useLogout();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-warm-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl font-bold text-brand-700">
          Amira
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden flex-1 px-8 md:block">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search woolen products..."
            className="w-full max-w-md rounded-full border border-warm-300 bg-warm-50 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-8 right-8 top-full z-50 mt-1 max-w-md overflow-hidden rounded-lg border border-warm-200 bg-white shadow-lg">
              {suggestions.map((s) => (
                <Link
                  key={s._id}
                  to={`/products/${s.slug}`}
                  className="block px-4 py-2 text-sm text-warm-700 hover:bg-warm-50"
                  onClick={() => setShowSuggestions(false)}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}
        </form>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Link to="/products" className="text-sm font-medium text-warm-600 hover:text-brand-700">
            Shop
          </Link>

          <Link to="/cart" className="relative text-sm font-medium text-warm-600 hover:text-brand-700">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-700 text-xs text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/orders" className="text-sm font-medium text-warm-600 hover:text-brand-700">
                Orders
              </Link>
              <Link to="/profile" className="text-sm font-medium text-warm-600 hover:text-brand-700">
                {user?.name?.split(' ')[0] || 'Profile'}
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="text-sm font-medium text-warm-500 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
