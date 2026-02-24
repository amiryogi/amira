import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, type CartItem } from '@/store/cart.store';
import { act } from '@testing-library/react';

const sampleItem: Omit<CartItem, 'quantity'> = {
  productId: 'prod-1',
  name: 'Dhaka Topi',
  slug: 'dhaka-topi',
  price: 800,
  image: 'https://example.com/topi.jpg',
  stock: 5,
};

const sampleItem2: Omit<CartItem, 'quantity'> = {
  productId: 'prod-2',
  name: 'Pashmina Shawl',
  slug: 'pashmina-shawl',
  price: 3500,
  image: 'https://example.com/shawl.jpg',
  stock: 3,
};

describe('Cart Store', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.setState({ items: [] });
    });
  });

  describe('addItem', () => {
    it('should add a new item with quantity 1', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual({ ...sampleItem, quantity: 1 });
    });

    it('should increment quantity when adding an existing item', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem);
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('should not exceed stock when adding repeatedly', () => {
      const lowStockItem = { ...sampleItem, stock: 2 };
      act(() => {
        useCartStore.getState().addItem(lowStockItem);
        useCartStore.getState().addItem(lowStockItem);
        useCartStore.getState().addItem(lowStockItem); // third add should cap at stock
      });
      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(2);
    });

    it('should handle multiple different items', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem2);
      });
      expect(useCartStore.getState().items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by productId', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem2);
        useCartStore.getState().removeItem('prod-1');
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('prod-2');
    });

    it('should do nothing when removing a non-existent item', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().removeItem('non-existent');
      });
      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity within bounds', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().updateQuantity('prod-1', 3);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(3);
    });

    it('should cap quantity at stock limit', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem); // stock: 5
        useCartStore.getState().updateQuantity('prod-1', 10);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should enforce minimum quantity of 1', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().updateQuantity('prod-1', 0);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });

    it('should enforce minimum when negative value is passed', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().updateQuantity('prod-1', -5);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem2);
        useCartStore.getState().clearCart();
      });
      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0);
    });

    it('should calculate total for single item', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().updateQuantity('prod-1', 2);
      });
      // 800 * 2 = 1600
      expect(useCartStore.getState().getTotal()).toBe(1600);
    });

    it('should calculate total for multiple items', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem); // 800 * 1
        useCartStore.getState().addItem(sampleItem2); // 3500 * 1
      });
      expect(useCartStore.getState().getTotal()).toBe(4300);
    });
  });

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0);
    });

    it('should return sum of all item quantities', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem2);
      });
      // 2 + 1 = 3
      expect(useCartStore.getState().getItemCount()).toBe(3);
    });
  });
});
