import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OrderItem } from "./types";

export type CartLine = OrderItem & { inventory: number };

type CartState = {
  lines: CartLine[];
  add: (line: CartLine) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product_id === line.product_id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.product_id === line.product_id
                  ? { ...l, quantity: Math.min(l.inventory, l.quantity + line.quantity) }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.product_id === productId
              ? { ...l, quantity: Math.max(1, Math.min(l.inventory, quantity)) }
              : l,
          ),
        })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.product_id !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "terra-cart" },
  ),
);

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.price_cents * l.quantity, 0);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
