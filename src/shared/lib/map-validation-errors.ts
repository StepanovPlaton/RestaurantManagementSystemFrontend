import type { ZodError } from "zod";

import { ApiError, ValidationError } from "@/shared/api/errors";

/** @alias mapValidationErrors — единый парсер 422 для форм */
export function parseValidationError(
  err: unknown,
): Record<string, string> | null {
  return mapValidationErrors(err);
}

export function mapValidationErrors(
  err: unknown,
): Record<string, string> | null {
  if (!(err instanceof ValidationError)) return null;

  const errors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(err.fields)) {
    errors[key] = messages[0] ?? "Ошибка";
  }
  return errors;
}

export function mapZodIssuesToFields(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}