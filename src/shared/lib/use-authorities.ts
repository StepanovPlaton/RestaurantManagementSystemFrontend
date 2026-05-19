"use client";

import { useMemo } from "react";

import { authStorage } from "@/shared/lib/auth-storage";
import { getAuthorities, hasAnyAuthority } from "@/shared/lib/jwt";

export function useAuthorities(): string[] {
  return useMemo(() => {
    const token = authStorage.getEmployeeAccessToken();
    if (!token) return [];
    return getAuthorities(token);
  }, []);
}

export function useHasAuthority(...required: string[]): boolean {
  const authorities = useAuthorities();
  return useMemo(
    () => required.some((role) => authorities.includes(role)),
    [authorities, required],
  );
}

export function useIsAdmin(): boolean {
  return useHasAuthority("ADMIN");
}
