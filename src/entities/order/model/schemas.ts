import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

const priceSchema = z.union([z.number(), z.string()]).transform((v) =>
  typeof v === "string" ? Number(v) : v,
);

export const orderSchema = z.object({
  id: z.number(),
  client_id: z.number(),
  address_id: z.number(),
  manager_id: z.number().nullable().optional(),
  courier_id: z.number().nullable().optional(),
  total_price: priceSchema,
  created_at: z.string(),
  address_text: z.string().optional(),
  client_first_name: z.string().optional(),
  client_last_name: z.string().optional(),
  client_middle_name: z.string().nullable().optional(),
});

export const ordersListSchema = createListSchema(orderSchema);

export const orderUpdateSchema = z.object({
  address_id: z.number().optional(),
  manager_id: z.number().nullable().optional(),
  courier_id: z.number().nullable().optional(),
});

export const orderStatusHistorySchema = z.object({
  id: z.number(),
  order_id: z.number(),
  status_id: z.number(),
  employee_id: z.number().nullable().optional(),
  client_id: z.number().nullable().optional(),
  comment: z.string().nullable().optional(),
  changed_at: z.string(),
});

export const orderStatusHistoryListSchema = createListSchema(
  orderStatusHistorySchema,
);

export const orderStatusHistoryCreateSchema = z.object({
  status_id: z.number(),
  comment: z.string().optional(),
});

export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  dish_id: z.number(),
  quantity: z.number(),
  price_at_moment: priceSchema,
});

export const orderItemsListSchema = createListSchema(orderItemSchema);

export const orderItemCreateSchema = z.object({
  dish_id: z.number(),
  quantity: z.coerce.number().int().min(1, "Минимум 1"),
});

export const orderCreateSchema = z.object({
  address_id: z.number(),
  items: z.array(orderItemCreateSchema).min(1, "Добавьте блюда в заказ"),
});

export const orderItemUpdateSchema = z.object({
  dish_id: z.number().optional(),
  quantity: z.coerce.number().int().min(1).optional(),
});

export type Order = z.infer<typeof orderSchema>;
export type OrdersList = z.infer<typeof ordersListSchema>;
export type OrderUpdate = z.infer<typeof orderUpdateSchema>;
export type OrderStatusHistory = z.infer<typeof orderStatusHistorySchema>;
export type OrderStatusHistoryCreate = z.infer<
  typeof orderStatusHistoryCreateSchema
>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderItemCreate = z.infer<typeof orderItemCreateSchema>;
export type OrderCreate = z.infer<typeof orderCreateSchema>;
export type OrderItemUpdate = z.infer<typeof orderItemUpdateSchema>;

export const ORDERS_KEY = "/orders";

export function ordersKey(params?: {
  client_id?: number;
  courier_id?: number;
}) {
  if (!params?.client_id && params?.courier_id == null) {
    return ORDERS_KEY;
  }
  const search = new URLSearchParams();
  if (params.client_id != null) {
    search.set("client_id", String(params.client_id));
  }
  if (params.courier_id != null) {
    search.set("courier_id", String(params.courier_id));
  }
  return `${ORDERS_KEY}?${search.toString()}` as const;
}
export const orderKey = (id: number) => `/orders/${id}` as const;
export const orderStatusHistoryKey = (orderId: number) =>
  `/orders/${orderId}/status-history` as const;
export const orderItemsKey = (orderId: number) =>
  `/orders/${orderId}/items` as const;
export const orderItemKey = (orderId: number, itemId: number) =>
  `/orders/${orderId}/items/${itemId}` as const;
