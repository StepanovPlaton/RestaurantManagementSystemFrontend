"use client";

import useSWR from "swr";

import { ingredientService } from "../api/ingredient.service";
import { INGREDIENTS_KEY, ingredientKey } from "./schemas";

export function useIngredients() {
  return useSWR(INGREDIENTS_KEY, () => ingredientService.getIngredients());
}

export function useIngredient(id: number | null) {
  return useSWR(
    id != null ? ingredientKey(id) : null,
    () => ingredientService.getIngredient(id!),
  );
}
