import { httpService } from "@/shared/api";
import type { AuthKind } from "@/shared/lib/jwt";

import {
  orderItemSchema,
  orderItemsListSchema,
  orderSchema,
  ordersListSchema,
  orderStatusHistoryListSchema,
  orderStatusHistorySchema,
  type Order,
  type OrderCreate,
  type OrderItem,
  type OrderItemCreate,
  type OrderItemUpdate,
  type OrderStatusHistory,
  type OrderStatusHistoryCreate,
  type OrderUpdate,
  type OrdersList,
} from "../model/schemas";

type OrdersQuery = {
  client_id?: number;
  courier_id?: number;
};

type AuthOptions = { authKind?: AuthKind };

export class OrderService {
  private buildOrdersPath(query?: OrdersQuery): string {
    if (!query?.client_id && query?.courier_id == null) {
      return "/orders";
    }
    const search = new URLSearchParams();
    if (query.client_id != null) {
      search.set("client_id", String(query.client_id));
    }
    if (query.courier_id != null) {
      search.set("courier_id", String(query.courier_id));
    }
    return `/orders?${search.toString()}`;
  }

  getOrders(
    query?: OrdersQuery,
    options: AuthOptions = {},
  ): Promise<OrdersList> {
    return httpService.get(this.buildOrdersPath(query), ordersListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  getOrder(id: number, options: AuthOptions = {}): Promise<Order> {
    return httpService.get(`/orders/${id}`, orderSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  createOrder(
    body: OrderCreate,
    options: AuthOptions = {},
  ): Promise<Order> {
    return httpService.post("/orders", body, orderSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  patchOrder(
    id: number,
    body: OrderUpdate,
    options: AuthOptions = {},
  ): Promise<Order> {
    return httpService.patch(`/orders/${id}`, body, orderSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  deleteOrder(id: number, options: AuthOptions = {}): Promise<void> {
    return httpService.delete(`/orders/${id}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }

  getStatusHistory(orderId: number, options: AuthOptions = {}) {
    return httpService.get(
      `/orders/${orderId}/status-history`,
      orderStatusHistoryListSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  addStatusHistory(
    orderId: number,
    body: OrderStatusHistoryCreate,
    options: AuthOptions = {},
  ): Promise<OrderStatusHistory> {
    return httpService.post(
      `/orders/${orderId}/status-history`,
      body,
      orderStatusHistorySchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  getOrderItems(orderId: number, options: AuthOptions = {}) {
    return httpService.get(`/orders/${orderId}/items`, orderItemsListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  createOrderItem(
    orderId: number,
    body: OrderItemCreate,
    options: AuthOptions = {},
  ): Promise<OrderItem> {
    return httpService.post(
      `/orders/${orderId}/items`,
      body,
      orderItemSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  patchOrderItem(
    orderId: number,
    itemId: number,
    body: OrderItemUpdate,
    options: AuthOptions = {},
  ): Promise<OrderItem> {
    return httpService.patch(
      `/orders/${orderId}/items/${itemId}`,
      body,
      orderItemSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  deleteOrderItem(
    orderId: number,
    itemId: number,
    options: AuthOptions = {},
  ): Promise<void> {
    return httpService.delete(`/orders/${orderId}/items/${itemId}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }
}

export const orderService = new OrderService();
