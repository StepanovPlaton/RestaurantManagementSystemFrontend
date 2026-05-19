"use client";

import useSWR from "swr";

import { roleService } from "../api/role.service";

const ROLES_KEY = "/roles";

export function useRoles() {
  return useSWR(ROLES_KEY, () => roleService.getRoles());
}
