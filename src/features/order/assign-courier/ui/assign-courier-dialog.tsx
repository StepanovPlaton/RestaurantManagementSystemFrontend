"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { useEmployees } from "@/entities/employee";
import {
  COOKING_STATUS_ID,
  DELIVERING_STATUS_ID,
  getCurrentStatusId,
  NEW_STATUS_ID,
  ORDERS_KEY,
  orderKey,
  orderService,
  orderStatusHistoryKey,
  useOrder,
  useOrderStatusHistory,
} from "@/entities/order";
import { ROLE_ID } from "@/shared/config/roles";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

type AssignCourierDialogProps = {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function employeeFullName(employee: {
  last_name: string;
  first_name: string;
  middle_name?: string | null;
}): string {
  return [employee.last_name, employee.first_name, employee.middle_name]
    .filter(Boolean)
    .join(" ");
}

export function AssignCourierDialog({
  orderId,
  open,
  onOpenChange,
}: AssignCourierDialogProps) {
  const { data: order, error: orderError, isLoading: orderLoading } = useOrder(
    open && orderId != null ? orderId : null,
  );
  const { data: history } = useOrderStatusHistory(
    open && orderId != null ? orderId : null,
  );
  const { data: couriers, isLoading: couriersLoading } = useEmployees({
    role_id: ROLE_ID.COURIER,
    is_working: true,
  });

  const [selectedCourierId, setSelectedCourierId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCouriers = couriers?.data ?? [];
  const currentStatusId = getCurrentStatusId(history?.data ?? []);

  useEffect(() => {
    if (!open) {
      setSelectedCourierId(null);
      return;
    }
    if (order?.courier_id != null) {
      setSelectedCourierId(order.courier_id);
    }
  }, [open, order?.courier_id]);

  async function refreshAfterAssign() {
    if (orderId == null) return;
    await Promise.all([
      mutate(ORDERS_KEY),
      mutate(orderKey(orderId)),
      mutate(orderStatusHistoryKey(orderId)),
    ]);
  }

  async function handleConfirm() {
    if (orderId == null || selectedCourierId == null) return;

    setIsSubmitting(true);
    try {
      await orderService.patchOrder(orderId, {
        courier_id: selectedCourierId,
      });

      const shouldSetDelivering =
        currentStatusId == null ||
        currentStatusId === NEW_STATUS_ID ||
        currentStatusId === COOKING_STATUS_ID;

      if (shouldSetDelivering) {
        await orderService.addStatusHistory(orderId, {
          status_id: DELIVERING_STATUS_ID,
        });
      }

      await refreshAfterAssign();
      toast.success("Курьер назначен, заказ в доставке");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось назначить курьера"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Назначить курьера
            {orderId != null ? ` — заказ #${orderId}` : ""}
          </DialogTitle>
        </DialogHeader>

        <AsyncState isLoading={orderLoading} error={orderError}>
          {couriersLoading ? (
            <p className="text-muted-foreground text-sm">Загрузка курьеров…</p>
          ) : availableCouriers.length === 0 ? (
            <Alert>
              <AlertTitle>Нет доступных курьеров</AlertTitle>
              <AlertDescription>
                Нет курьеров со статусом «Свободен» (на смене). Попросите
                курьера включить «Статус: работаю» или создайте курьера в
                разделе «Курьеры» (администратор).
              </AlertDescription>
            </Alert>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-md border">
              {availableCouriers.map((courier) => {
                const selected = selectedCourierId === courier.id;
                return (
                  <li key={courier.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
                        selected && "bg-muted",
                      )}
                      onClick={() => setSelectedCourierId(courier.id)}
                    >
                      <span className="font-medium">
                        {employeeFullName(courier)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {courier.phone}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AsyncState>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            disabled={
              isSubmitting ||
              selectedCourierId == null ||
              availableCouriers.length === 0
            }
            onClick={() => void handleConfirm()}
          >
            {isSubmitting ? "Назначение…" : "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
