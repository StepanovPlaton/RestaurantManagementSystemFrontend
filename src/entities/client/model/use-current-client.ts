"use client";

import { useMemo } from "react";

import { authStorage } from "@/shared/lib/auth-storage";
import { decodeJwtPayload } from "@/shared/lib/jwt";

import { clientService } from "../api/client.service";
import { useClients } from "./use-clients";

export function useCurrentClient() {
  const login =
    typeof window !== "undefined"
      ? decodeJwtPayload(authStorage.getClientAccessToken() ?? "")?.sub ?? null
      : null;

  const { data: clientsList, error, isLoading, mutate } = useClients({
    authKind: "client",
  });

  const client = useMemo(() => {
    if (!login || !clientsList?.data) return undefined;
    return clientsList.data.find((c) => c.login === login);
  }, [login, clientsList?.data]);

  const clientId = client?.id ?? null;

  return {
    client,
    clientId,
    login,
    error,
    isLoading,
    mutate,
    isReady: clientId != null,
  };
}
