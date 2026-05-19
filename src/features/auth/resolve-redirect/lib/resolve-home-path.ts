const STAFF_PREFIX = "/staff";
const COURIER_PREFIX = "/courier";
const CLIENT_PREFIX = "/app";

function isPathAllowedForAuthorities(pathname: string, authorities: string[]): boolean {
  if (authorities.includes("CLIENT")) {
    return pathname === CLIENT_PREFIX || pathname.startsWith(`${CLIENT_PREFIX}/`);
  }
  if (authorities.includes("COURIER")) {
    return pathname === COURIER_PREFIX || pathname.startsWith(`${COURIER_PREFIX}/`);
  }
  if (authorities.includes("ADMIN") || authorities.includes("MANAGER")) {
    return pathname === STAFF_PREFIX || pathname.startsWith(`${STAFF_PREFIX}/`);
  }
  return false;
}

export function resolveHomePath(authorities: string[]): string | null {
  if (authorities.includes("CLIENT")) return CLIENT_PREFIX;
  if (authorities.includes("COURIER")) return `${COURIER_PREFIX}/orders`;
  if (authorities.includes("ADMIN") || authorities.includes("MANAGER")) {
    return `${STAFF_PREFIX}/orders`;
  }
  return null;
}

export function resolvePostLoginPath(
  authorities: string[],
  from?: string | null,
): string {
  if (from && isPathAllowedForAuthorities(from, authorities)) {
    return from;
  }
  return resolveHomePath(authorities) ?? "/login";
}
