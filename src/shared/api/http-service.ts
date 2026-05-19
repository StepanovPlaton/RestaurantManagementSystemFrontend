import type { ZodType } from "zod";

import { env } from "@/shared/config/env";
import { authStorage } from "@/shared/lib/auth-storage";
import type { AuthKind } from "@/shared/lib/jwt";

import { redirectToLogin } from "@/shared/lib/redirect-to-login";

import { ApiError, parseApiError } from "./errors";
import type { TokenPair } from "./types";

type RequestOptions = {
  authKind?: AuthKind;
  body?: unknown;
  headers?: HeadersInit;
  skipAuth?: boolean;
  _retried?: boolean;
};

type TokenResponseBody = TokenPair & {
  token_type?: string;
  expires_in?: number;
};

export class HttpService {
  resolveUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${env.apiUrl}${normalizedPath}`;
  }

  async get<T>(path: string, schema?: ZodType<T>, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, schema, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    schema?: ZodType<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, schema, { ...options, body });
  }

  async put<T>(
    path: string,
    body?: unknown,
    schema?: ZodType<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", path, schema, { ...options, body });
  }

  async patch<T>(
    path: string,
    body?: unknown,
    schema?: ZodType<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", path, schema, { ...options, body });
  }

  async delete<T>(
    path: string,
    schema?: ZodType<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("DELETE", path, schema, options);
  }

  async upload<T>(
    path: string,
    formData: FormData,
    schema?: ZodType<T>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, schema, {
      ...options,
      body: formData,
      isMultipart: true,
    });
  }

  private async request<T>(
    method: string,
    path: string,
    schema?: ZodType<T>,
    options: RequestOptions & { isMultipart?: boolean } = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (!options.isMultipart && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (!options.skipAuth) {
      const token = authStorage.getAccessToken(options.authKind);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    let body: BodyInit | undefined;
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body !== undefined) {
      body = JSON.stringify(options.body);
    }

    const response = await fetch(this.resolveUrl(path), {
      method,
      headers,
      body,
    });

    if (response.status === 401 && !options.skipAuth && !options._retried) {
      const refreshed = await this.tryRefresh(options.authKind);
      if (refreshed) {
        return this.request<T>(method, path, schema, {
          ...options,
          _retried: true,
        });
      }
      throw await parseApiError(response);
    }

    if (!response.ok) {
      throw await parseApiError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = (await response.json()) as unknown;

    if (schema) {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new ApiError(500, "Invalid API response shape", {
          error: "Schema validation failed",
          details: parsed.error.message,
        });
      }
      return parsed.data;
    }

    return data as T;
  }

  private async tryRefresh(authKind?: AuthKind): Promise<boolean> {
    const kind = authKind ?? authStorage.getActiveAuthKind();
    if (!kind) return false;

    const refreshToken = authStorage.getRefreshToken(kind);
    if (!refreshToken) {
      this.clearTokensForKind(kind);
      return false;
    }

    const refreshPath =
      kind === "employee" ? "/auth/employees/refresh" : "/auth/clients/refresh";

    try {
      const response = await fetch(this.resolveUrl(refreshPath), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        this.clearTokensForKind(kind);
        return false;
      }

      const tokens = (await response.json()) as TokenResponseBody;

      if (kind === "employee") {
        authStorage.setEmployeeTokens(tokens);
      } else {
        authStorage.setClientTokens(tokens);
      }

      return true;
    } catch {
      this.clearTokensForKind(kind);
      return false;
    }
  }

  private clearTokensForKind(kind: AuthKind): void {
    if (kind === "employee") {
      authStorage.clearEmployeeTokens();
    } else {
      authStorage.clearClientTokens();
    }
    if (!authStorage.getActiveAuthKind()) {
      redirectToLogin();
    }
  }
}

export const httpService = new HttpService();
