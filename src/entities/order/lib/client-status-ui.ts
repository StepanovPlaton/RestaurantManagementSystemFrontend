import { CANCELLED_STATUS_ID } from "./order-status-catalog";

export type ClientUiStep = "new" | "cooking" | "delivering" | "delivered";

const NEW_ID = 1;
const COOKING_ID = 2;
const DELIVERING_ID = 3;
const DELIVERED_ID = 4;

export const CLIENT_UI_STEPS: { key: ClientUiStep; label: string }[] = [
  { key: "new", label: "Принят" },
  { key: "cooking", label: "Готовится" },
  { key: "delivering", label: "В пути" },
  { key: "delivered", label: "Доставлен" },
];

export function toClientStep(
  statusId: number | null | undefined,
): ClientUiStep | "cancelled" | null {
  if (statusId == null) return null;
  if (statusId === CANCELLED_STATUS_ID) return "cancelled";
  if (statusId === NEW_ID) return "new";
  if (statusId === COOKING_ID) return "cooking";
  if (statusId === DELIVERING_ID) return "delivering";
  if (statusId === DELIVERED_ID) return "delivered";
  return null;
}

export function clientStepLabel(statusId: number | null | undefined): string {
  const step = toClientStep(statusId);
  if (step === "cancelled") return "Отменён";
  if (step == null) return "—";
  return CLIENT_UI_STEPS.find((s) => s.key === step)?.label ?? "—";
}

export function canClientCancel(statusId: number | null | undefined): boolean {
  return statusId === NEW_ID || statusId === COOKING_ID;
}

export function canClientConfirmDelivery(
  statusId: number | null | undefined,
): boolean {
  return statusId === DELIVERING_ID;
}

export function isClientOrderTerminal(
  statusId: number | null | undefined,
): boolean {
  return (
    statusId === DELIVERED_ID ||
    statusId === CANCELLED_STATUS_ID
  );
}

export const DELIVERED_STATUS_ID = DELIVERED_ID;
