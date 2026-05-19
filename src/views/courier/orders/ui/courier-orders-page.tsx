"use client";

import { useCourierEmployee } from "@/entities/employee";
import { useOrders } from "@/entities/order";
import { ToggleWorking } from "@/features/courier/toggle-working";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { AsyncState } from "@/shared/ui/async-state";

import { CourierOrderCard } from "./courier-order-card";

const ORDERS_REFRESH_MS = 8000;

export function CourierOrdersPage() {
  const { employeeId, isApiBlocked, isLoading: employeeLoading } =
    useCourierEmployee();

  const { data, error, isLoading } = useOrders({
    courier_id: employeeId ?? undefined,
    refreshInterval: ORDERS_REFRESH_MS,
    enabled: employeeId != null,
  });

  const showEmployeeWarning = !employeeLoading && employeeId == null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Мои заказы</h2>
        <p className="text-muted-foreground text-sm">
          Назначенные вам заказы на доставку
        </p>
      </div>

      <ToggleWorking />

      {showEmployeeWarning && (
        <Alert variant="destructive">
          <AlertTitle>Профиль недоступен</AlertTitle>
          <AlertDescription>
            {isApiBlocked
              ? "Не удалось загрузить профиль курьера. Проверьте вход и доступ к API."
              : "Не удалось определить ID курьера."}
          </AlertDescription>
        </Alert>
      )}

      {employeeId == null ? (
        <p className="text-muted-foreground text-sm">
          Список заказов появится после загрузки профиля.
        </p>
      ) : (
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.data.length}
          emptyMessage="Нет назначенных заказов"
        >
          <ul className="flex flex-col gap-3">
            {data?.data.map((order) => (
              <li key={order.id}>
                <CourierOrderCard order={order} />
              </li>
            ))}
          </ul>
        </AsyncState>
      )}
    </div>
  );
}
