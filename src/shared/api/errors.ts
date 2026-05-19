export type ErrorBody = {
  error?: string;
  message?: string;
  details?: string;
  exception?: string;
  timestamp?: string;
};

export type ValidationErrorBody = ErrorBody & {
  fields?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly error: string;
  readonly details?: string;

  constructor(
    status: number,
    message: string,
    options?: { error?: string; details?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = options?.error ?? "Error";
    this.details = options?.details;
  }
}

export class ValidationError extends ApiError {
  readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    fields: Record<string, string[]>,
    options?: { error?: string; details?: string },
  ) {
    super(422, message, { error: options?.error ?? "Validation Error", ...options });
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  let body: ErrorBody | ValidationErrorBody | null = null;

  try {
    const text = await response.text();
    if (text) {
      body = JSON.parse(text) as ErrorBody | ValidationErrorBody;
    }
  } catch {
    body = null;
  }

  const message =
    body?.message ??
    response.statusText ??
    `Request failed with status ${status}`;

  if (status === 422 && body && "fields" in body && body.fields) {
    return new ValidationError(message, body.fields, {
      error: body.error,
      details: body.details,
    });
  }

  return new ApiError(status, message, {
    error: body?.error,
    details: body?.details,
  });
}
