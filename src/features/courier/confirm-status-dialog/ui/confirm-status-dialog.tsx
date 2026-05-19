"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  orderKey,
  orderService,
  ordersKey,
  orderStatusHistoryKey,
} from "@/entities/order";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

type ConfirmStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  targetStatusId: number;
  orderLabel?: string;
  addressLabel?: string;
  onSuccess?: () => void;
  courierId?: number | null;
};

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  orderId,
  targetStatusId,
  orderLabel,
  addressLabel,
  onSuccess,
  courierId,
}: ConfirmStatusDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await orderService.addStatusHistory(orderId, {
        status_id: targetStatusId,
      });
      await Promise.all([
        mutate(ordersKey()),
        mutate(ordersKey({ courier_id: courierId ?? undefined })),
        mutate(orderKey(orderId)),
        mutate(orderStatusHistoryKey(orderId)),
      ]);
      toast.success("Статус заказа обновлён");
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить статус"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Подтвердить доставку?</DialogTitle>
          <DialogDescription>
            {orderLabel && (
              <span className="block font-medium text-foreground">
                {orderLabel}
              </span>
            )}
            {addressLabel && <span className="block">{addressLabel}</span>}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={handleConfirm}>
            {isSubmitting ? "Сохранение…" : "Подтвердить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
