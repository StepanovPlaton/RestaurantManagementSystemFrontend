"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  CANCELLED_STATUS_ID,
  DELIVERED_STATUS_ID,
  canClientCancel,
  canClientConfirmDelivery,
  clientStepLabel,
  getCurrentStatusId,
  isClientOrderTerminal,
  orderKey,
  orderService,
  orderStatusHistoryKey,
  useOrder,
  useOrderItems,
  useOrderStatusHistory,
} from "@/entities/order";
import { formatPrice } from "@/shared/lib/format-price";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { OrderTrackingStepper } from "@/widgets/order-tracking-stepper";

const POLL_MS = 5000;

export function ClientOrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const validId = Number.isFinite(orderId) && orderId > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: order, error, isLoading } = useOrder(validId ? orderId : null, {
    authKind: "client",
    refreshInterval: POLL_MS,
  });
  const { data: history, mutate: mutateHistory } = useOrderStatusHistory(
    validId ? orderId : null,
    { authKind: "client", refreshInterval: POLL_MS },
  );
  const { data: items } = useOrderItems(validId ? orderId : null, {
    authKind: "client",
  });

  const currentStatusId = getCurrentStatusId(history?.data ?? []);
  const statusLabel = clientStepLabel(currentStatusId);
  const terminal = isClientOrderTerminal(currentStatusId);
  const showCancel = canClientCancel(currentStatusId);
  const showConfirm = canClientConfirmDelivery(currentStatusId);

  const itemsList = useMemo(() => items?.data ?? [], [items?.data]);

  async function postStatus(statusId: number, comment?: string) {
    if (!validId) return;
    setIsSubmitting(true);
    try {
      await orderService.addStatusHistory(
        orderId,
        { status_id: statusId, comment },
        { authKind: "client" },
      );
      await Promise.all([
        mutateHistory(),
        mutate(orderKey(orderId)),
        mutate(orderStatusHistoryKey(orderId)),
      ]);
      toast.success("Статус обновлён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить статус"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!validId) {
    return <p className="text-muted-foreground text-sm">Некорректный заказ</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit -ml-2"
        onClick={() => router.push("/app/orders")}
      >
        <ArrowLeftIcon className="size-4" />
        К заказам
      </Button>

      <AsyncState isLoading={isLoading} error={error}>
        {order && (
          <>
            <div>
              <h2 className="text-lg font-semibold">Заказ #{order.id}</h2>
              <p className="text-muted-foreground text-sm">{statusLabel}</p>
            </div>

            <OrderTrackingStepper currentStatusId={currentStatusId} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Состав</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {itemsList.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-2"
                  >
                    <span>
                      Блюдо #{item.dish_id} × {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.price_at_moment) * item.quantity)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Итого</span>
                  <span>{formatPrice(Number(order.total_price))}</span>
                </div>
              </CardContent>
            </Card>

            {!terminal && (
              <div className="flex flex-col gap-2">
                {showConfirm && (
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() =>
                      postStatus(DELIVERED_STATUS_ID, "Подтверждено клиентом")
                    }
                  >
                    Подтвердить получение
                  </Button>
                )}
                {showCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={() =>
                      postStatus(CANCELLED_STATUS_ID, "Отмена клиентом")
                    }
                  >
                    Отменить заказ
                  </Button>
                )}
              </div>
            )}

            {terminal && currentStatusId === DELIVERED_STATUS_ID && (
              <p className="text-muted-foreground text-center text-sm">
                Заказ доставлен. Спасибо!
              </p>
            )}

            {currentStatusId === CANCELLED_STATUS_ID && (
              <p className="text-muted-foreground text-center text-sm">
                Заказ отменён.{" "}
                <Link href="/app" className="text-primary underline">
                  В меню
                </Link>
              </p>
            )}
          </>
        )}
      </AsyncState>
    </div>
  );
}
