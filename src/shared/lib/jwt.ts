export type AuthKind = "employee" | "client";

export type JwtPayload = {
  sub?: string;
  authorities?: string[];
  type?: string;
  exp?: number;
  iat?: number;
};

const EMPLOYEE_ROLES = new Set(["ADMIN", "MANAGER", "COURIER"]);

function decodeBase64Url(base64: string): string {
  if (typeof globalThis.atob !== "function") {
    throw new Error("atob is not available");
  }
  return globalThis.atob(base64);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeBase64Url(padded);

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAuthorities(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload?.authorities || !Array.isArray(payload.authorities)) {
    return [];
  }
  return payload.authorities;
}

export function getAuthKind(token: string): AuthKind | null {
  const authorities = getAuthorities(token);

  if (authorities.includes("CLIENT")) {
    return "client";
  }

  if (
    authorities.includes("EMPLOYEE") ||
    authorities.some((a) => EMPLOYEE_ROLES.has(a))
  ) {
    return "employee";
  }

  return null;
}

export function hasAnyAuthority(token: string, required: string[]): boolean {
  const authorities = getAuthorities(token);
  return required.some((role) => authorities.includes(role));
}
