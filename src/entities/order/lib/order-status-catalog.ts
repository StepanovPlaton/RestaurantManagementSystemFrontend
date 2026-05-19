export const ORDER_STATUS_CATALOG = [
  { id: 1, status_name: "NEW", label: "Новый" },
  { id: 2, status_name: "COOKING", label: "Готовится" },
  { id: 3, status_name: "DELIVERING", label: "Доставляется" },
  { id: 4, status_name: "DELIVERED", label: "Доставлен" },
  { id: 5, status_name: "CANCELLED", label: "Отменён" },
] as const;

export const NEW_STATUS_ID = 1;
export const COOKING_STATUS_ID = 2;
export const DELIVERING_STATUS_ID = 3;
export const DELIVERED_STATUS_ID = 4;
export const CANCELLED_STATUS_ID = 5;

export type OrderStatusName =
  (typeof ORDER_STATUS_CATALOG)[number]["status_name"];

export function statusIdToLabel(statusId: number | null | undefined): string {
  if (statusId == null) return "—";
  const found = ORDER_STATUS_CATALOG.find((s) => s.id === statusId);
  return found?.label ?? `Статус #${statusId}`;
}

/** Подпись статуса в таблице заказов менеджера (сценарий «Назначить заказ курьеру»). */
export function statusIdToManagerTableLabel(
  statusId: number | null | undefined,
): string {
  if (statusId === DELIVERING_STATUS_ID) return "В доставке";
  return statusIdToLabel(statusId);
}

export function statusIdToName(statusId: number | null | undefined): string | null {
  if (statusId == null) return null;
  return ORDER_STATUS_CATALOG.find((s) => s.id === statusId)?.status_name ?? null;
}

export function statusOptionsFromCatalog() {
  return ORDER_STATUS_CATALOG.map((s) => ({
    value: String(s.id),
    label: s.label,
  }));
}
