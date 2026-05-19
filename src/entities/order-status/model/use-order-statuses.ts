"use client";

import useSWR from "swr";

import { useIsAdmin } from "@/shared/lib/use-authorities";

import { orderStatusService } from "../api/order-status.service";
import { ORDER_STATUSES_KEY } from "./schemas";

export function useOrderStatuses() {
  const isAdmin = useIsAdmin();
  return useSWR(isAdmin ? ORDER_STATUSES_KEY : null, () =>
    orderStatusService.getOrderStatuses(),
  );
}
