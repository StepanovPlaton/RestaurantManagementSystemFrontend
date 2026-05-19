"use client";

import { z } from "zod";
import useSWR from "swr";

import { httpService } from "@/shared/api";
import type { AuthKind } from "@/shared/lib/jwt";

const avatarSchema = z.object({
  id: z.number(),
  path: z.string(),
});

export function useAvatar(
  avatarId: number | null | undefined,
  options?: { authKind?: AuthKind },
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    avatarId ? [`/avatars/${avatarId}`, authKind] : null,
    () =>
      httpService.get(`/avatars/${avatarId}`, avatarSchema, {
        authKind,
      }),
  );
}
