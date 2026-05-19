import type { OrderStatusHistory } from "../model/schemas";

export function getCurrentStatusId(
  history: OrderStatusHistory[],
): number | null {
  if (history.length === 0) return null;
  const latest = [...history].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  )[0];
  return latest.status_id;
}
