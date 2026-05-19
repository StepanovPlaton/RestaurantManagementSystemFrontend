"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { mutate } from "swr";
import { toast } from "sonner";

import { clientDisplayName, useClient } from "@/entities/client";
import { useDishes } from "@/entities/dish";
import {
  getCurrentStatusId,
  ORDERS_KEY,
  orderItemsKey,
  orderKey,
  orderService,
  orderStatusHistoryKey,
  statusOptionsFromCatalog,
  useOrder,
  useOrderItems,
  useOrderStatusHistory,
} from "@/entities/order";
import { useOrderStatuses } from "@/entities/order-status";
import { formatPrice } from "@/shared/lib/format-price";
import {
  getErrorMessage,
  mapValidationErrors,
} from "@/shared/lib/map-validation-errors";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/ui/native-select";
import { Separator } from "@/shared/ui/separator";

type OrderFormDialogProps = {
  orderId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderFormDialog({
  orderId,
  open,
  onOpenChange,
}: OrderFormDialogProps) {
  const isAdmin = useIsAdmin();
  const { data: order, error: orderError, isLoading: orderLoading } = useOrder(
    open && orderId != null ? orderId : null,
  );
  const { data: client } = useClient(order?.client_id ?? null);
  const { data: history, mutate: mutateHistory } = useOrderStatusHistory(
    open && orderId != null ? orderId : null,
  );
  const { data: items, mutate: mutateItems } = useOrderItems(
    open && orderId != null ? orderId : null,
  );
  const { data: dishes } = useDishes();
  const { data: orderStatusesApi } = useOrderStatuses();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusId, setStatusId] = useState("");
  const [newDishId, setNewDishId] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStatusId = getCurrentStatusId(history?.data ?? []);

  const statusOptions = useMemo(() => {
    if (isAdmin && orderStatusesApi?.data.length) {
      return orderStatusesApi.data.map((s) => ({
        value: String(s.id),
        label:
          statusOptionsFromCatalog().find((c) => c.value === String(s.id))
            ?.label ?? s.status_name,
      }));
    }
    return statusOptionsFromCatalog();
  }, [isAdmin, orderStatusesApi]);

  const dishNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const d of dishes?.data ?? []) {
      map.set(d.id, d.name);
    }
    return map;
  }, [dishes]);

  useEffect(() => {
    if (!open || !order) return;
    setStatusId(currentStatusId != null ? String(currentStatusId) : "");
    setNewDishId("");
    setNewQuantity("1");
  }, [open, order, currentStatusId]);

  async function refreshOrderData() {
    if (orderId == null) return;
    await Promise.all([
      mutate(ORDERS_KEY),
      mutate(orderKey(orderId)),
      mutate(orderStatusHistoryKey(orderId)),
      mutate(orderItemsKey(orderId)),
      mutateHistory(),
      mutateItems(),
    ]);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (orderId == null || !order) return;

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const newStatus = statusId === "" ? null : Number(statusId);
      if (newStatus != null && newStatus !== currentStatusId) {
        await orderService.addStatusHistory(orderId, {
          status_id: newStatus,
        });
      }

      await refreshOrderData();
      toast.success("Заказ сохранён");
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) setFieldErrors(validation);
      else toast.error(getErrorMessage(err, "Не удалось сохранить заказ"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddItem() {
    if (orderId == null || !newDishId) return;

    try {
      await orderService.createOrderItem(orderId, {
        dish_id: Number(newDishId),
        quantity: Number(newQuantity) || 1,
      });
      await refreshOrderData();
      setNewDishId("");
      setNewQuantity("1");
      toast.success("Позиция добавлена");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось добавить позицию"));
    }
  }

  async function handleUpdateItemQuantity(itemId: number, quantity: number) {
    if (orderId == null || quantity < 1) return;

    try {
      await orderService.patchOrderItem(orderId, itemId, { quantity });
      await refreshOrderData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить количество"));
    }
  }

  async function handleDeleteItem(itemId: number) {
    if (orderId == null) return;
    if (!confirm("Удалить позицию из заказа?")) return;

    try {
      await orderService.deleteOrderItem(orderId, itemId);
      await refreshOrderData();
      toast.success("Позиция удалена");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить позицию"));
    }
  }

  const clientName = client
    ? clientDisplayName(client)
    : order
      ? `Клиент #${order.client_id}`
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактирование заказа</DialogTitle>
        </DialogHeader>

        <AsyncState isLoading={orderLoading} error={orderError}>
          {order && (
            <form onSubmit={handleSave} className="grid gap-4">
              <FormField label="Клиент">
                <div className="flex items-center gap-2">
                  <Input value={clientName} readOnly className="bg-muted/50" />
                  {client && (
                    <Link
                      href={`/staff/clients?client=${client.id}`}
                      className="inline-flex h-7 shrink-0 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
                    >
                      Карточка
                    </Link>
                  )}
                </div>
              </FormField>

              <FormField label="Итоговая стоимость">
                <Input
                  value={formatPrice(order.total_price)}
                  readOnly
                  className="bg-muted/50"
                />
              </FormField>

              <FormField label="Статус">
                <NativeSelect
                  className="w-full"
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                >
                  {statusOptions.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </FormField>

              <Separator />

              <div className="space-y-3">
                <Label>Блюда</Label>
                <ul className="space-y-2">
                  {items?.data.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <span className="min-w-0 flex-1">
                        {dishNameById.get(item.dish_id) ??
                          `Блюдо #${item.dish_id}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          className="h-8 w-16"
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const q = Number(e.target.value);
                            if (q !== item.quantity) {
                              void handleUpdateItemQuantity(item.id, q);
                            }
                          }}
                        />
                        <span className="text-muted-foreground text-xs">
                          {formatPrice(item.price_at_moment)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => void handleDeleteItem(item.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </li>
                  ))}
                  {items?.data.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Позиций нет
                    </p>
                  )}
                </ul>

                <div className="flex flex-wrap items-end gap-2">
                  <NativeSelect
                    className="min-w-[140px] flex-1"
                    value={newDishId}
                    onChange={(e) => setNewDishId(e.target.value)}
                  >
                    <NativeSelectOption value="">Выберите блюдо</NativeSelectOption>
                    {dishes?.data.map((d) => (
                      <NativeSelectOption key={d.id} value={String(d.id)}>
                        {d.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <Input
                    type="number"
                    min={1}
                    className="h-8 w-16"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!newDishId}
                    onClick={() => void handleAddItem()}
                  >
                    Добавить
                  </Button>
                </div>
              </div>

              <DialogFooter className="flex-row flex-wrap gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Закрыть
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение…" : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </AsyncState>
      </DialogContent>
    </Dialog>
  );
}
