import { type NextRequest, NextResponse } from "next/server";

import { getAuthorities } from "@/shared/lib/jwt";

const EMPLOYEE_ACCESS_COOKIE = "fr_employee_access";
const CLIENT_ACCESS_COOKIE = "fr_client_access";

function decodeCookieToken(request: NextRequest, name: string): string | null {
  const raw = request.cookies.get(name)?.value;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(EMPLOYEE_ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CLIENT_ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
}

function redirectToLogin(request: NextRequest, clearCookies = false): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  if (clearCookies) {
    clearAuthCookies(response);
  }
  return response;
}

function redirectToRoleHome(
  request: NextRequest,
  authorities: string[],
): NextResponse | null {
  if (authorities.includes("COURIER")) {
    return NextResponse.redirect(new URL("/courier/orders", request.url));
  }
  if (authorities.includes("ADMIN") || authorities.includes("MANAGER")) {
    return NextResponse.redirect(new URL("/staff/orders", request.url));
  }
  if (authorities.includes("CLIENT")) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return null;
}

function checkEmployeeRoute(
  request: NextRequest,
  requiredRoles: string[],
): NextResponse | null {
  const employeeToken = decodeCookieToken(request, EMPLOYEE_ACCESS_COOKIE);
  const clientToken = decodeCookieToken(request, CLIENT_ACCESS_COOKIE);

  if (clientToken && !employeeToken) {
    return redirectToLogin(request, true);
  }

  if (!employeeToken) return redirectToLogin(request);

  const authorities = getAuthorities(employeeToken);
  const hasEmployeeContour =
    authorities.includes("EMPLOYEE") ||
    authorities.some((a) => ["ADMIN", "MANAGER", "COURIER"].includes(a));

  if (!hasEmployeeContour) return redirectToLogin(request, true);

  const allowed = requiredRoles.some((role) => authorities.includes(role));
  if (!allowed) {
    return redirectToRoleHome(request, authorities) ?? redirectToLogin(request, true);
  }

  return null;
}

function checkClientRoute(request: NextRequest): NextResponse | null {
  const clientToken = decodeCookieToken(request, CLIENT_ACCESS_COOKIE);
  const employeeToken = decodeCookieToken(request, EMPLOYEE_ACCESS_COOKIE);

  if (employeeToken && !clientToken) {
    return redirectToLogin(request, true);
  }

  if (!clientToken) return redirectToLogin(request);

  const authorities = getAuthorities(clientToken);
  if (!authorities.includes("CLIENT")) {
    return redirectToLogin(request, true);
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/staff")) {
    const denied = checkEmployeeRoute(request, ["ADMIN", "MANAGER"]);
    if (denied) return denied;

    const employeeToken = decodeCookieToken(request, EMPLOYEE_ACCESS_COOKIE);
    if (employeeToken) {
      const authorities = getAuthorities(employeeToken);
      const isAdminOnlyStaffRoute =
        pathname.startsWith("/staff/managers") ||
        pathname.startsWith("/staff/couriers");
      if (isAdminOnlyStaffRoute && !authorities.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/staff/orders", request.url));
      }
    }
  }

  if (pathname.startsWith("/courier")) {
    const denied = checkEmployeeRoute(request, ["COURIER"]);
    if (denied) return denied;
  }

  if (pathname.startsWith("/app")) {
    const denied = checkClientRoute(request);
    if (denied) return denied;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/staff",
    "/staff/:path*",
    "/courier",
    "/courier/:path*",
    "/app",
    "/app/:path*",
  ],
};
