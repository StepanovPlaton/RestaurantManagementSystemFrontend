"use client";

import { useEffect } from "react";

import { logout } from "@/features/auth/logout";
import { authStorage } from "@/shared/lib/auth-storage";
import type { AuthKind } from "@/shared/lib/jwt";

export function useSessionGuard(expectedKind: AuthKind): void {
  useEffect(() => {
    const token =
      expectedKind === "employee"
        ? authStorage.getEmployeeAccessToken()
        : authStorage.getClientAccessToken();

    if (!token) {
      logout();
    }
  }, [expectedKind]);
}
