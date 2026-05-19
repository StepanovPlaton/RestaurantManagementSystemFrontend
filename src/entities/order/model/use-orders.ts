"use client";

import useSWR from "swr";

import type { AuthKind } from "@/shared/lib/jwt";

import { orderService } from "../api/order.service";
import {
  orderItemsKey,
  orderKey,
  ordersKey,
  orderStatusHistoryKey,
} from "./schemas";

type UseOrdersParams = {
  client_id?: number;
  courier_id?: number;
  refreshInterval?: number;
  enabled?: boolean;
  authKind?: AuthKind;
};

const clientAuth = { authKind: "client" as const };

export function useOrders(params?: UseOrdersParams) {
  const {
    refreshInterval,
    enabled = true,
    authKind = "employee",
    ...query
  } = params ?? {};
  const auth = authKind === "client" ? clientAuth : {};
  const key = enabled ? ordersKey(query) : null;
  return useSWR(
    key,
    () => orderService.getOrders(query, auth),
    refreshInterval != null ? { refreshInterval } : undefined,
  );
}

export function useOrder(
  id: number | null,
  options?: { authKind?: AuthKind; refreshInterval?: number },
) {
  const authKind = options?.authKind ?? "employee";
  const auth = authKind === "client" ? clientAuth : {};
  return useSWR(
    id != null ? orderKey(id) : null,
    () => orderService.getOrder(id!, auth),
    options?.refreshInterval != null
      ? { refreshInterval: options.refreshInterval }
      : undefined,
  );
}

export function useOrderStatusHistory(
  orderId: number | null,
  options?: { authKind?: AuthKind; refreshInterval?: number },
) {
  const authKind = options?.authKind ?? "employee";
  const auth = authKind === "client" ? clientAuth : {};
  return useSWR(
    orderId != null ? orderStatusHistoryKey(orderId) : null,
    () => orderService.getStatusHistory(orderId!, auth),
    options?.refreshInterval != null
      ? { refreshInterval: options.refreshInterval }
      : undefined,
  );
}

export function useOrderItems(
  orderId: number | null,
  options?: { authKind?: AuthKind },
) {
  const authKind = options?.authKind ?? "employee";
  const auth = authKind === "client" ? clientAuth : {};
  return useSWR(orderId != null ? orderItemsKey(orderId) : null, () =>
    orderService.getOrderItems(orderId!, auth),
  );
}
