"use client";

import Link from "next/link";

import {
  clientStepLabel,
  getCurrentStatusId,
  useOrderItems,
  useOrderStatusHistory,
  type Order,
} from "@/entities/order";
import { formatPrice } from "@/shared/lib/format-price";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

type ClientOrderCardProps = {
  order: Order;
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ClientOrderCard({ order }: ClientOrderCardProps) {
  const { data: history, isLoading: historyLoading } = useOrderStatusHistory(
    order.id,
    { authKind: "client" },
  );
  const { data: items, isLoading: itemsLoading } = useOrderItems(order.id, {
    authKind: "client",
  });

  const statusId = getCurrentStatusId(history?.data ?? []);
  const statusLabel = clientStepLabel(statusId);
  const itemsCount = items?.total ?? items?.data.length ?? 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">Заказ #{order.id}</p>
            <p className="text-muted-foreground text-xs">
              {formatDate(order.created_at)}
            </p>
          </div>
          {historyLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <Badge variant="outline" className="font-normal">
              {statusLabel}
            </Badge>
          )}
        </div>
        <p className="text-sm">
          {itemsLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <>
              {itemsCount} {itemsCount === 1 ? "позиция" : "позиций"} ·{" "}
              {formatPrice(Number(order.total_price))}
            </>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          render={<Link href={`/app/orders/${order.id}`} />}
        >
          Отследить
        </Button>
      </CardContent>
    </Card>
  );
}
