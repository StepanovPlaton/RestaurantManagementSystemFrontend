"use client";

import useSWR from "swr";

import type { AuthKind } from "@/shared/lib/jwt";

import { dishService } from "../api/dish.service";
import {
  DISHES_KEY,
  dishIngredientsKey,
  dishKey,
  dishPhotosKey,
} from "./schemas";

type DishHookOptions = { authKind?: AuthKind };

export function useDishes(options?: DishHookOptions) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(DISHES_KEY, () => dishService.getDishes({ authKind }));
}

export function useDish(id: number | null, options?: DishHookOptions) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(id != null ? dishKey(id) : null, () =>
    dishService.getDish(id!, { authKind }),
  );
}

export function useDishIngredients(
  dishId: number | null,
  options?: DishHookOptions,
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    dishId != null ? dishIngredientsKey(dishId) : null,
    () => dishService.getDishIngredients(dishId!, { authKind }),
  );
}

export function useDishPhotos(
  dishId: number | null,
  options?: DishHookOptions,
) {
  const authKind = options?.authKind ?? "employee";
  return useSWR(
    dishId != null ? dishPhotosKey(dishId) : null,
    () => dishService.getDishPhotos(dishId!, { authKind }),
  );
}
