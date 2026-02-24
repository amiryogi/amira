import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import CartPage from '@/pages/CartPage';
import { act } from '@testing-library/react';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const sampleCartItem = {
  productId: 'prod-1',
  name: 'Dhaka Topi',
  slug: 'dhaka-topi',
  price: 800,
  image: 'https://example.com/topi.jpg',
  stock: 5,
  quantity: 2,
};

const sampleCartItem2 = {
  productId: 'prod-2',
  name: 'Pashmina Shawl',
  slug: 'pashmina-shawl',
  price: 3500,
  image: 'https://example.com/shawl.jpg',
  stock: 3,
  quantity: 1,
};

describe('CartPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    act(() => {
      useCartStore.setState({ items: [] });
      useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
    });
  });

  describe('empty cart', () => {
    it('should display empty state message', () => {
      render(<CartPage />);
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText(/haven't added any products/i)).toBeInTheDocument();
    });

    it('should show browse products link', () => {
      render(<CartPage />);
      expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute(
        'href',
        '/products'
      );
    });
  });

  describe('with items', () => {
    beforeEach(() => {
      act(() => {
        useCartStore.setState({ items: [sampleCartItem, sampleCartItem2] });
      });
    });

    it('should display cart items', () => {
      render(<CartPage />);
      expect(screen.getByText('Dhaka Topi')).toBeInTheDocument();
      expect(screen.getByText('Pashmina Shawl')).toBeInTheDocument();
    });

    it('should display item prices', () => {
      render(<CartPage />);
      expect(screen.getByText('Rs. 800')).toBeInTheDocument();
      expect(screen.getByText('Rs. 3,500')).toBeInTheDocument();
    });

    it('should display item quantities', () => {
      render(<CartPage />);
      expect(screen.getByText('2')).toBeInTheDocument(); // sampleCartItem quantity
    });

    it('should display order summary with total', () => {
      render(<CartPage />);
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      // Total: (800 * 2) + (3500 * 1) = 5100
      const totals = screen.getAllByText('Rs. 5,100');
      expect(totals.length).toBeGreaterThanOrEqual(1);
    });

    it('should remove an item when remove button is clicked', async () => {
      render(<CartPage />);
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);
      expect(useCartStore.getState().items).toHaveLength(1);
    });

    it('should clear cart when clear cart button is clicked', async () => {
      render(<CartPage />);
      const clearButton = screen.getByRole('button', { name: /clear cart/i });
      await user.click(clearButton);
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('checkout access', () => {
    beforeEach(() => {
      act(() => {
        useCartStore.setState({ items: [sampleCartItem] });
      });
    });

    it('should show login button when not authenticated', () => {
      render(<CartPage />);
      const loginLink = screen.getByRole('link', { name: /login to checkout/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should show checkout button when authenticated', () => {
      act(() => {
        useAuthStore.setState({
          accessToken: 'token',
          user: {
            _id: 'user-1',
            name: 'Test',
            email: 'test@example.com',
            role: 'USER',
            isVerified: true,
            isDeleted: false,
            tokenVersion: 0,
            password: '',
            createdAt: '',
            updatedAt: '',
          },
          isAuthenticated: true,
        });
      });
      render(<CartPage />);
      const checkoutLink = screen.getByRole('link', { name: /proceed to checkout/i });
      expect(checkoutLink).toHaveAttribute('href', '/checkout');
    });
  });
});
