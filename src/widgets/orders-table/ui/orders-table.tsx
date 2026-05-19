"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";
import { RefreshCwIcon } from "lucide-react";

import { useClients } from "@/entities/client";
import {
  CANCELLED_STATUS_ID,
  DELIVERED_STATUS_ID,
  getCurrentStatusId,
  NEW_STATUS_ID,
  ORDERS_KEY,
  orderService,
  orderStatusHistoryKey,
  useOrders,
  type Order,
} from "@/entities/order";
import { AssignCourierDialog } from "@/features/order/assign-courier/ui/assign-courier-dialog";
import { OrderFormDialog } from "@/features/order/edit/ui/order-form-dialog";
import { clickableTableRowClassName } from "@/shared/lib/table-row";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { AsyncState } from "@/shared/ui/async-state";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

import { OrderStatusBadge } from "./order-status-badge";

type StatusFilter = "NEW" | "ALL";

function formatOrderTime(iso: string) {
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

function clientDisplayName(
  order: Order,
  clients: Map<number, { first_name: string; last_name: string }>,
): string {
  if (order.client_first_name || order.client_last_name) {
    return [order.client_last_name, order.client_first_name]
      .filter(Boolean)
      .join(" ");
  }
  const client = clients.get(order.client_id);
  if (!client) return `Клиент #${order.client_id}`;
  return [client.last_name, client.first_name].filter(Boolean).join(" ");
}

function canAssignOrCancel(statusId: number | null | undefined): boolean {
  return (
    statusId != null &&
    statusId !== CANCELLED_STATUS_ID &&
    statusId !== DELIVERED_STATUS_ID
  );
}

export function OrdersTable() {
  const isAdmin = useIsAdmin();
  const { data, error, isLoading, mutate: mutateOrders } = useOrders();
  const { data: clientsData } = useClients();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("NEW");
  const [statusByOrderId, setStatusByOrderId] = useState<
    Record<number, number | null>
  >({});
  const [statusMapLoading, setStatusMapLoading] = useState(false);

  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState<number | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const clientsMap = useMemo(() => {
    const map = new Map<number, { first_name: string; last_name: string }>();
    for (const c of clientsData?.data ?? []) {
      map.set(c.id, { first_name: c.first_name, last_name: c.last_name });
    }
    return map;
  }, [clientsData]);

  const loadStatusMap = useCallback(async (orders: Order[]) => {
    if (orders.length === 0) {
      setStatusByOrderId({});
      return;
    }
    setStatusMapLoading(true);
    try {
      const entries = await Promise.all(
        orders.map(async (order) => {
          const history = await orderService.getStatusHistory(order.id);
          return [order.id, getCurrentStatusId(history.data)] as const;
        }),
      );
      setStatusByOrderId(Object.fromEntries(entries));
    } catch {
      toast.error("Не удалось загрузить статусы заказов");
    } finally {
      setStatusMapLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data?.data) return;
    void loadStatusMap(data.data);
  }, [data?.data, loadStatusMap]);

  const filteredOrders = useMemo(() => {
    const orders = data?.data ?? [];
    if (statusFilter === "ALL") return orders;
    return orders.filter(
      (order) => statusByOrderId[order.id] === NEW_STATUS_ID,
    );
  }, [data?.data, statusFilter, statusByOrderId]);

  function openEdit(order: Order) {
    setEditingOrderId(order.id);
    setEditDialogOpen(true);
  }

  function openAssign(order: Order) {
    setAssignOrderId(order.id);
    setAssignDialogOpen(true);
  }

  async function handleRefresh() {
    await mutateOrders();
    if (data?.data) {
      await loadStatusMap(data.data);
    }
    toast.success("Список заказов обновлён");
  }

  async function handleCancelOrder(order: Order) {
    if (!confirm(`Отменить заказ #${order.id}?`)) return;
    try {
      await orderService.addStatusHistory(order.id, {
        status_id: CANCELLED_STATUS_ID,
        comment: "Заказ отменён",
      });
      await Promise.all([
        mutate(ORDERS_KEY),
        mutate(orderStatusHistoryKey(order.id)),
      ]);
      if (data?.data) await loadStatusMap(data.data);
      toast.success("Заказ отменён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось отменить заказ"));
    }
  }

  async function handleDelete(order: Order) {
    if (!confirm(`Удалить заказ #${order.id}?`)) return;
    try {
      await orderService.deleteOrder(order.id);
      await mutate(ORDERS_KEY);
      if (data?.data) await loadStatusMap(data.data);
      toast.success("Заказ удалён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить заказ"));
    }
  }

  const tableLoading = isLoading || statusMapLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>Список заказов</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <NativeSelect
            className="h-9 w-[140px]"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as StatusFilter)
            }
          >
            <NativeSelectOption value="NEW">Новые</NativeSelectOption>
            <NativeSelectOption value="ALL">Все</NativeSelectOption>
          </NativeSelect>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={tableLoading}
            onClick={() => void handleRefresh()}
          >
            <RefreshCwIcon className="size-4" />
            Обновить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AsyncState
          isLoading={tableLoading}
          error={error}
          isEmpty={!filteredOrders.length}
          emptyMessage={
            statusFilter === "NEW"
              ? "Новых заказов нет"
              : "Заказов пока нет"
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">№ заказа</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Адрес доставки</TableHead>
                <TableHead>Время заказа</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusId = statusByOrderId[order.id];
                const showOrderActions = canAssignOrCancel(statusId);

                return (
                  <TableRow
                    key={order.id}
                    className={clickableTableRowClassName}
                    onClick={() => openEdit(order)}
                  >
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <OrderStatusBadge orderId={order.id} />
                    </TableCell>
                    <TableCell>
                      {clientDisplayName(order, clientsMap)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {order.address_text ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                      {formatOrderTime(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <TableActionsMenu
                        extraItems={
                          showOrderActions
                            ? [
                                {
                                  label: "Назначить курьера",
                                  onClick: () => openAssign(order),
                                },
                                {
                                  label: "Отменить заказ",
                                  onClick: () => void handleCancelOrder(order),
                                  variant: "destructive",
                                },
                              ]
                            : []
                        }
                        onDelete={
                          isAdmin
                            ? () => void handleDelete(order)
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AsyncState>
      </CardContent>

      <OrderFormDialog
        orderId={editingOrderId}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingOrderId(null);
        }}
      />

      <AssignCourierDialog
        orderId={assignOrderId}
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) setAssignOrderId(null);
          if (!open && data?.data) void loadStatusMap(data.data);
        }}
      />
    </Card>
  );
}
