import { create } from 'zustand';

import type { CartItem, Product } from '../types/pos';

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return { items: [...state.items, { product, quantity: 1 }] };
      }

      return {
        items: state.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  clearCart: () => set({ items: [] }),
}));
