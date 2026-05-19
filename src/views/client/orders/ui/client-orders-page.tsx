"use client";

import { useCurrentClient } from "@/entities/client";
import { useOrders } from "@/entities/order";
import { AsyncState } from "@/shared/ui/async-state";

import { ClientOrderCard } from "./client-order-card";

export function ClientOrdersPage() {
  const { clientId, isReady } = useCurrentClient();
  const { data, error, isLoading } = useOrders({
    client_id: clientId ?? undefined,
    enabled: isReady,
    authKind: "client",
  });

  const orders = [...(data?.data ?? [])].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Мои заказы</h2>
      <AsyncState
        isLoading={isLoading || !isReady}
        error={error}
        isEmpty={orders.length === 0}
        emptyMessage="Заказов пока нет"
      >
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <ClientOrderCard order={order} />
            </li>
          ))}
        </ul>
      </AsyncState>
    </div>
  );
}
