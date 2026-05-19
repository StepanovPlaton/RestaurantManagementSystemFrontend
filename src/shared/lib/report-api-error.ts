import { toast } from "sonner";

import { ApiError, ValidationError } from "@/shared/api/errors";

import { getErrorMessage } from "./map-validation-errors";

/** Toast for mutation errors; skips 422 (form fields) and 401 (refresh/logout). */
export function reportApiError(err: unknown, fallback: string): void {
  if (err instanceof ValidationError) return;
  if (err instanceof ApiError && err.status === 401) return;
  toast.error(getErrorMessage(err, fallback));
}
