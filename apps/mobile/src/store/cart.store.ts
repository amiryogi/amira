import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isLoaded: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  getTotal: () => number;
  getCount: () => number;
}

const CART_KEY = '@amira_cart';

const persistCart = (items: CartItem[]) => {
  AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoaded: false,

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === item.productId);

    let updated: CartItem[];
    if (existing) {
      updated = items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
          : i,
      );
    } else {
      updated = [...items, { ...item, quantity: 1 }];
    }
    set({ items: updated });
    persistCart(updated);
  },

  removeItem: (productId) => {
    const updated = get().items.filter((i) => i.productId !== productId);
    set({ items: updated });
    persistCart(updated);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    const updated = get().items.map((i) =>
      i.productId === productId
        ? { ...i, quantity: Math.min(quantity, i.stock) }
        : i,
    );
    set({ items: updated });
    persistCart(updated);
  },

  clearCart: () => {
    set({ items: [] });
    AsyncStorage.removeItem(CART_KEY).catch(() => {});
  },

  loadCart: async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      if (stored) {
        set({ items: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
