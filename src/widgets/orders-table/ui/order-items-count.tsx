"use client";

import { useOrderItems } from "@/entities/order";
import { Skeleton } from "@/shared/ui/skeleton";

type OrderItemsCountProps = {
  orderId: number;
};

export function OrderItemsCount({ orderId }: OrderItemsCountProps) {
  const { data, isLoading } = useOrderItems(orderId);

  if (isLoading) {
    return <Skeleton className="inline-block h-4 w-6" />;
  }

  const totalQty =
    data?.data.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return <span>{totalQty}</span>;
}
