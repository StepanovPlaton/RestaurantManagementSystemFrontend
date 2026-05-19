import type { AuthKind } from "@/shared/lib/jwt";
import type { TokenPair } from "@/shared/api/types";

const KEYS = {
  employee: {
    access: "fr_employee_access",
    refresh: "fr_employee_refresh",
    cookie: "fr_employee_access",
  },
  client: {
    access: "fr_client_access",
    refresh: "fr_client_refresh",
    cookie: "fr_client_access",
  },
} as const;

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readStorage(key: string): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(key);
}

function writeStorage(key: string, value: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, value);
}

function removeStorage(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

function setTokens(kind: AuthKind, tokens: TokenPair): void {
  const keys = KEYS[kind];
  writeStorage(keys.access, tokens.access_token);
  writeStorage(keys.refresh, tokens.refresh_token);
  setCookie(keys.cookie, tokens.access_token);
}

function clearTokens(kind: AuthKind): void {
  const keys = KEYS[kind];
  removeStorage(keys.access);
  removeStorage(keys.refresh);
  clearCookie(keys.cookie);
}

export const authStorage = {
  getEmployeeAccessToken(): string | null {
    return readStorage(KEYS.employee.access);
  },

  getEmployeeRefreshToken(): string | null {
    return readStorage(KEYS.employee.refresh);
  },

  getClientAccessToken(): string | null {
    return readStorage(KEYS.client.access);
  },

  getClientRefreshToken(): string | null {
    return readStorage(KEYS.client.refresh);
  },

  setEmployeeTokens(tokens: TokenPair): void {
    clearTokens("client");
    setTokens("employee", tokens);
  },

  setClientTokens(tokens: TokenPair): void {
    clearTokens("employee");
    setTokens("client", tokens);
  },

  clearEmployeeTokens(): void {
    clearTokens("employee");
  },

  clearClientTokens(): void {
    clearTokens("client");
  },

  clearAll(): void {
    this.clearEmployeeTokens();
    this.clearClientTokens();
  },

  getActiveAuthKind(): AuthKind | null {
    if (this.getEmployeeAccessToken()) return "employee";
    if (this.getClientAccessToken()) return "client";
    return null;
  },

  getAccessToken(kind?: AuthKind): string | null {
    const resolved = kind ?? this.getActiveAuthKind();
    if (resolved === "employee") return this.getEmployeeAccessToken();
    if (resolved === "client") return this.getClientAccessToken();
    return null;
  },

  getRefreshToken(kind?: AuthKind): string | null {
    const resolved = kind ?? this.getActiveAuthKind();
    if (resolved === "employee") return this.getEmployeeRefreshToken();
    if (resolved === "client") return this.getClientRefreshToken();
    return null;
  },
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as Window & { authStorage?: typeof authStorage }).authStorage =
    authStorage;
}
