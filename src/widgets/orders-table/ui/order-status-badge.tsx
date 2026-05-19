"use client";

import {
  getCurrentStatusId,
  statusIdToManagerTableLabel,
  statusIdToName,
  useOrderStatusHistory,
} from "@/entities/order";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

type OrderStatusBadgeProps = {
  orderId: number;
};

function variantForStatus(
  statusName: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (statusName) {
    case "DELIVERED":
      return "default";
    case "CANCELLED":
      return "secondary";
    case "DELIVERING":
      return "outline";
    default:
      return "outline";
  }
}

export function OrderStatusBadge({ orderId }: OrderStatusBadgeProps) {
  const { data, isLoading } = useOrderStatusHistory(orderId);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  const statusId = getCurrentStatusId(data?.data ?? []);
  const label = statusIdToManagerTableLabel(statusId);
  const name = statusIdToName(statusId);

  return (
    <Badge variant={variantForStatus(name)} className="font-normal">
      {label}
    </Badge>
  );
}
