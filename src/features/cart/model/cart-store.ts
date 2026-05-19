"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { cartTotalItems, cartTotalPrice } from "../lib/cart-totals";
import type { CartItemInput, CartLine } from "./types";

type CartState = {
  items: CartLine[];
  addItem: (input: CartItemInput, quantity?: number) => void;
  setQuantity: (dishId: number, quantity: number) => void;
  removeItem: (dishId: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (input, quantity = 1) => {
        const qty = Math.max(1, quantity);
        set((state) => {
          const existing = state.items.find((i) => i.dish_id === input.dish_id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.dish_id === input.dish_id
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          const line: CartLine = {
            dish_id: input.dish_id,
            name: input.name,
            price: input.price,
            quantity: qty,
            photo_path: input.photo_path,
          };
          return { items: [...state.items, line] };
        });
      },
      setQuantity: (dishId, quantity) => {
        if (quantity < 1) {
          get().removeItem(dishId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.dish_id === dishId ? { ...i, quantity } : i,
          ),
        }));
      },
      removeItem: (dishId) => {
        set((state) => ({
          items: state.items.filter((i) => i.dish_id !== dishId),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: "fr_client_cart" },
  ),
);

export function useCartItems() {
  return useCartStore((s) => s.items);
}

export function useCartItemCount() {
  return useCartStore((s) => cartTotalItems(s.items));
}

export function useCartTotalPrice() {
  return useCartStore((s) => cartTotalPrice(s.items));
}

export function useCartActions() {
  return useCartStore(
    useShallow((s) => ({
      addItem: s.addItem,
      setQuantity: s.setQuantity,
      removeItem: s.removeItem,
      clearCart: s.clearCart,
    })),
  );
}
