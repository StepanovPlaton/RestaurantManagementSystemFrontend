import {
  CANCELLED_STATUS_ID,
  COOKING_STATUS_ID,
  DELIVERED_STATUS_ID,
  DELIVERING_STATUS_ID,
  NEW_STATUS_ID,
} from "./order-status-catalog";

export type CourierUiStep = "accepted" | "delivering" | "delivered";

const ACCEPTED_IDS = new Set([NEW_STATUS_ID, COOKING_STATUS_ID]);

export const COURIER_UI_STEPS: { key: CourierUiStep; label: string }[] = [
  { key: "accepted", label: "Принят" },
  { key: "delivering", label: "В пути" },
  { key: "delivered", label: "Доставлен" },
];

export function toCourierStep(
  statusId: number | null | undefined,
): CourierUiStep | "cancelled" | null {
  if (statusId == null) return null;
  if (statusId === CANCELLED_STATUS_ID) return "cancelled";
  if (ACCEPTED_IDS.has(statusId)) return "accepted";
  if (statusId === DELIVERING_STATUS_ID) return "delivering";
  if (statusId === DELIVERED_STATUS_ID) return "delivered";
  return null;
}

export function courierStepLabel(
  statusId: number | null | undefined,
): string {
  const step = toCourierStep(statusId);
  if (step === "cancelled") return "Отменён";
  if (step == null) return "—";
  return COURIER_UI_STEPS.find((s) => s.key === step)?.label ?? "—";
}

/** Next status_id for courier action button, or null if terminal / cancelled. */
export function getNextCourierStatusId(
  statusId: number | null | undefined,
): number | null {
  if (statusId == null || statusId === CANCELLED_STATUS_ID) return null;
  if (ACCEPTED_IDS.has(statusId)) return DELIVERING_STATUS_ID;
  if (statusId === DELIVERING_STATUS_ID) return DELIVERED_STATUS_ID;
  return null;
}

export function getCourierStatusActionLabel(
  statusId: number | null | undefined,
): string | null {
  const next = getNextCourierStatusId(statusId);
  if (next === DELIVERING_STATUS_ID) return "В пути";
  if (next === DELIVERED_STATUS_ID) return "Доставлен";
  return null;
}

export function isCourierStatusTerminal(
  statusId: number | null | undefined,
): boolean {
  return (
    statusId === DELIVERED_STATUS_ID ||
    statusId === CANCELLED_STATUS_ID ||
    getNextCourierStatusId(statusId) == null
  );
}

/** Метки списка заказов курьера (рис. 23 пояснительной записки). */
export function courierListBadgeLabel(
  statusId: number | null | undefined,
  hasCourier: boolean,
): string {
  if (statusId === DELIVERED_STATUS_ID) return "Доставлен";
  if (statusId === DELIVERING_STATUS_ID) return "В пути";
  if (
    hasCourier &&
    statusId != null &&
    ACCEPTED_IDS.has(statusId)
  ) {
    return "Назначен";
  }
  return courierStepLabel(statusId);
}
