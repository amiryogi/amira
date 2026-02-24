import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="border-t border-warm-200 bg-warm-900 text-warm-300">
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="font-display text-xl font-bold text-white">Amira Nepal</h3>
          <p className="mt-2 text-sm text-warm-400">
            Authentic Nepali woolen products — handcrafted with tradition and love.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-200">Shop</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/products" className="text-sm hover:text-white">All Products</Link></li>
            <li><Link to="/products?isFeatured=true" className="text-sm hover:text-white">Featured</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-200">Account</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/profile" className="text-sm hover:text-white">Profile</Link></li>
            <li><Link to="/orders" className="text-sm hover:text-white">Orders</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-warm-200">Contact</h4>
          <ul className="mt-3 space-y-2">
            <li className="text-sm">Kathmandu, Nepal</li>
            <li className="text-sm">info@amira.com.np</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-warm-800 pt-6 text-center text-sm text-warm-500">
        &copy; {new Date().getFullYear()} Amira Nepal. All rights reserved.
      </div>
    </div>
  </footer>
);
