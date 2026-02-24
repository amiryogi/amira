import { useCartStore } from '@/store/cart.store';
import { act } from '@testing-library/react-native';

const sampleItem = {
  productId: 'prod-1',
  name: 'Dhaka Topi',
  price: 800,
  image: 'https://example.com/topi.jpg',
  stock: 5,
};

const sampleItem2 = {
  productId: 'prod-2',
  name: 'Pashmina Shawl',
  price: 3500,
  image: 'https://example.com/shawl.jpg',
  stock: 3,
};

describe('Cart Store', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.setState({ items: [], isLoaded: true });
    });
  });

  describe('addItem', () => {
    it('should add a new item with quantity 1', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(1);
      expect(items[0].name).toBe('Dhaka Topi');
    });

    it('should increment quantity for existing item', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem);
      });
      expect(useCartStore.getState().items).toHaveLength(1);
      expect(useCartStore.getState().items[0].quantity).toBe(2);
    });

    it('should cap quantity at stock limit', () => {
      const lowStock = { ...sampleItem, stock: 2 };
      act(() => {
        useCartStore.getState().addItem(lowStock);
        useCartStore.getState().addItem(lowStock);
        useCartStore.getState().addItem(lowStock);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(2);
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
    it('should remove item by productId', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem2);
        useCartStore.getState().removeItem('prod-1');
      });
      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('prod-2');
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

    it('should cap at stock', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem); // stock: 5
        useCartStore.getState().updateQuantity('prod-1', 10);
      });
      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('should ignore quantity less than 1', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().updateQuantity('prod-1', 0);
      });
      // quantity stays at 1 (initial)
      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('should remove all items', () => {
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

    it('should calculate total correctly', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);   // 800
        useCartStore.getState().addItem(sampleItem2);  // 3500
      });
      expect(useCartStore.getState().getTotal()).toBe(4300);
    });
  });

  describe('getCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getCount()).toBe(0);
    });

    it('should return total item quantities', () => {
      act(() => {
        useCartStore.getState().addItem(sampleItem);
        useCartStore.getState().addItem(sampleItem); // qty 2
        useCartStore.getState().addItem(sampleItem2);  // qty 1
      });
      expect(useCartStore.getState().getCount()).toBe(3);
    });
  });
});
