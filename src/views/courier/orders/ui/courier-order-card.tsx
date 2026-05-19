"use client";

import Link from "next/link";

import {
  courierListBadgeLabel,
  getCurrentStatusId,
  orderAddressDisplay,
  useOrderItems,
  useOrderStatusHistory,
  type Order,
} from "@/entities/order";
import { formatPrice } from "@/shared/lib/format-price";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type CourierOrderCardProps = {
  order: Order;
};

export function CourierOrderCard({ order }: CourierOrderCardProps) {
  const { data: history, isLoading: historyLoading } = useOrderStatusHistory(
    order.id,
  );
  const { data: items, isLoading: itemsLoading } = useOrderItems(order.id);

  const statusId = getCurrentStatusId(history?.data ?? []);
  const statusLabel = courierListBadgeLabel(
    statusId,
    order.courier_id != null,
  );
  const itemsCount = items?.total ?? items?.data.length ?? 0;

  return (
    <Link href={`/courier/orders/${order.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold">Заказ #{order.id}</span>
            {historyLoading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <Badge variant="outline" className="font-normal">
                {statusLabel}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {orderAddressDisplay(order)}
          </p>
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>
              {itemsLoading ? (
                <Skeleton className="inline-block h-4 w-20" />
              ) : (
                `${itemsCount} ${itemsCount === 1 ? "блюдо" : "блюд"}`
              )}
            </span>
            <span className="font-medium text-foreground">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
