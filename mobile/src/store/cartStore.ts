import { create } from 'zustand';

import type { CartItem, Product } from '../types/pos';

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  decreaseItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  updateItemNotes: (productId: number, notes: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);

      if (!existingItem) {
        return { items: [...state.items, { product, quantity: 1, notes: null }] };
      }

      return {
        items: state.items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    }),
  decreaseItem: (productId) =>
    set((state) => ({
      items: state.items
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    })),
  updateItemNotes: (productId, notes) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, notes: notes.trim() || null } : item,
      ),
    })),
  clearCart: () => set({ items: [] }),
}));
