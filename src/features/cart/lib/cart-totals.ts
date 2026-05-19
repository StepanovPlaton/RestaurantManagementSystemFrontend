import type { CartLine } from "../model/types";

export function cartTotalItems(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotalPrice(items: CartLine[]): number {
  return items.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
