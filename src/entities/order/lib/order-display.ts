import type { Order } from "../model/schemas";

export function orderClientDisplayName(order: Order): string {
  const parts = [
    order.client_last_name,
    order.client_first_name,
    order.client_middle_name,
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  return `Клиент #${order.client_id}`;
}

export function orderAddressDisplay(order: Order): string {
  if (order.address_text?.trim()) return order.address_text;
  return `Адрес #${order.address_id}`;
}
