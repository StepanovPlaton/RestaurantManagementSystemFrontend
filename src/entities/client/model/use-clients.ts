"use client";

import useSWR from "swr";

import type { AuthKind } from "@/shared/lib/jwt";

import { clientService } from "../api/client.service";
import { CLIENTS_KEY, clientAddressesKey, clientKey } from "./schemas";

type ClientHookOptions = { authKind?: AuthKind };

export function useClients(options?: ClientHookOptions) {
  const authKind = options?.authKind ?? "employee";
  const key =
    authKind === "client" ? ([CLIENTS_KEY, "client"] as const) : CLIENTS_KEY;
  return useSWR(key, () => clientService.getClients({ authKind }));
}

export function useClient(
  id: number | null,
  options?: ClientHookOptions,
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    id != null ? [clientKey(id), authKind] : null,
    () => clientService.getClient(id!, { authKind }),
  );
}

export function useClientAddresses(
  clientId: number | null,
  options?: ClientHookOptions,
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    clientId != null ? [clientAddressesKey(clientId), authKind] : null,
    () => clientService.getAddresses(clientId!, { authKind }),
  );
}
