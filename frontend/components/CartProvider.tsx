'use client';

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { Product } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, qty: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],

  addItem: (product) => {
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, quantity: 1 }] };
    });
  },

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== productId),
    })),

  updateQuantity: (productId, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === productId ? { ...i, quantity: Math.max(1, qty) } : i
      ),
    })),

  clearCart: () => set({ items: [] }),

  total: () => {
    const { items } = get();
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  itemCount: () => {
    const { items } = get();
    return items.reduce((sum, i) => sum + i.quantity, 0);
  },
    }),
    {
      name: 'mini-ecommerce-cart',
      // Không tự khôi phục ngay khi khởi tạo để tránh lệch SSR/hydration;
      // CartPersistGate sẽ khôi phục giỏ hàng từ localStorage sau khi trang đã mount.
      skipHydration: true,
    }
  )
);

/** Mount 1 lần trong layout để khôi phục giỏ hàng đã lưu từ localStorage. */
export function CartPersistGate() {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);
  return null;
}
