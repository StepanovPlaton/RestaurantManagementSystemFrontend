"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { mutate } from "swr";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

import { useDishes } from "@/entities/dish";
import { useCourierEmployee } from "@/entities/employee";
import {
  getCourierStatusActionLabel,
  getCurrentStatusId,
  getNextCourierStatusId,
  isCourierStatusTerminal,
  orderAddressDisplay,
  orderClientDisplayName,
  orderKey,
  orderService,
  ordersKey,
  orderStatusHistoryKey,
  useOrder,
  useOrderItems,
  useOrderStatusHistory,
} from "@/entities/order";
import { ConfirmStatusDialog } from "@/features/courier/confirm-status-dialog";
import { formatPrice } from "@/shared/lib/format-price";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { OrderStatusStepper } from "@/widgets/order-status-stepper";

const DELIVERED_STATUS_ID = 4;

export function CourierOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { employeeId } = useCourierEmployee();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validId = Number.isFinite(orderId) && orderId > 0;

  const { data: order, error, isLoading } = useOrder(validId ? orderId : null);
  const { data: history, mutate: mutateHistory } = useOrderStatusHistory(
    validId ? orderId : null,
  );
  const { data: items } = useOrderItems(validId ? orderId : null);
  const { data: dishes } = useDishes();

  const dishMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const d of dishes?.data ?? []) {
      map.set(d.id, d.name);
    }
    return map;
  }, [dishes]);

  const currentStatusId = getCurrentStatusId(history?.data ?? []);
  const actionLabel = getCourierStatusActionLabel(currentStatusId);
  const nextStatusId = getNextCourierStatusId(currentStatusId);
  const isTerminal = isCourierStatusTerminal(currentStatusId);

  async function applyStatus(statusId: number) {
    if (!validId) return;
    setIsSubmitting(true);
    try {
      await orderService.addStatusHistory(orderId, { status_id: statusId });
      await Promise.all([
        mutate(ordersKey()),
        mutate(ordersKey({ courier_id: employeeId ?? undefined })),
        mutate(orderKey(orderId)),
        mutate(orderStatusHistoryKey(orderId)),
        mutateHistory(),
      ]);
      toast.success("Статус заказа обновлён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить статус"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusAction() {
    if (nextStatusId == null) return;
    if (nextStatusId === DELIVERED_STATUS_ID) {
      setConfirmOpen(true);
      return;
    }
    await applyStatus(nextStatusId);
  }

  if (!validId) {
    return (
      <p className="text-muted-foreground text-sm">Некорректный номер заказа</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/courier/orders"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" />
        К списку заказов
      </Link>

      <AsyncState isLoading={isLoading} error={error} isEmpty={!order}>
        {order && (
          <>
            <div>
              <h2 className="text-lg font-semibold">Заказ #{order.id}</h2>
              <p className="text-muted-foreground text-sm">
                {orderClientDisplayName(order)}
              </p>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Адрес доставки</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{orderAddressDisplay(order)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Статус</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusStepper currentStatusId={currentStatusId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Состав заказа</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {items?.data.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span>
                      {dishMap.get(item.dish_id) ?? `Блюдо #${item.dish_id}`} ×{" "}
                      {item.quantity}
                    </span>
                    <span>{formatPrice(item.price_at_moment * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Итого</span>
                  <span>{formatPrice(order.total_price)}</span>
                </div>
              </CardContent>
            </Card>

            {!isTerminal && actionLabel && (
              <Button
                className="w-full"
                size="lg"
                disabled={isSubmitting}
                onClick={handleStatusAction}
              >
                {isSubmitting ? "Сохранение…" : actionLabel}
              </Button>
            )}

            <ConfirmStatusDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              orderId={orderId}
              targetStatusId={DELIVERED_STATUS_ID}
              orderLabel={`Заказ #${order.id}`}
              addressLabel={orderAddressDisplay(order)}
              courierId={employeeId}
              onSuccess={() => router.push("/courier/orders")}
            />
          </>
        )}
      </AsyncState>
    </div>
  );
}
