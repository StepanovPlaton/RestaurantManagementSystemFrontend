"use client";

import useSWR from "swr";

import type { AuthKind } from "@/shared/lib/jwt";

import { menuService } from "../api/menu.service";
import { ACTIVE_MENUS_KEY, MENUS_KEY, menuDishesKey, menuKey } from "./schemas";

type MenuHookOptions = { authKind?: AuthKind };

export function useMenus(options?: MenuHookOptions) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(MENUS_KEY, () => menuService.getMenus(undefined, { authKind }));
}

export function useActiveMenus(options?: MenuHookOptions) {
  const authKind = options?.authKind ?? "client";
  return useSWR(ACTIVE_MENUS_KEY, () =>
    menuService.getMenus(true, { authKind }),
  );
}

export function useMenu(id: number | null, options?: MenuHookOptions) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(id != null ? menuKey(id) : null, () =>
    menuService.getMenu(id!, { authKind }),
  );
}

export function useMenuDishes(
  menuId: number | null,
  options?: MenuHookOptions,
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    menuId != null ? menuDishesKey(menuId) : null,
    () => menuService.getMenuDishes(menuId!, { authKind }),
  );
}
