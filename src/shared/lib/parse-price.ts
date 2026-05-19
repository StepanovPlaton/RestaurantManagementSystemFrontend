export function parsePrice(value: number | string): number {
  return typeof value === "string" ? Number(value) : value;
}
