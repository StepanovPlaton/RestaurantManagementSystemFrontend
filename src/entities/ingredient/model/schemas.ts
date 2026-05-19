import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

export const ingredientSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ingredientsListSchema = createListSchema(ingredientSchema);

export const ingredientCreateSchema = z.object({
  name: z.string().min(1, "Укажите название"),
});

export const ingredientUpdateSchema = ingredientCreateSchema;

export type Ingredient = z.infer<typeof ingredientSchema>;
export type IngredientsList = z.infer<typeof ingredientsListSchema>;
export type IngredientCreate = z.infer<typeof ingredientCreateSchema>;
export type IngredientUpdate = z.infer<typeof ingredientUpdateSchema>;

export const INGREDIENTS_KEY = "/ingredients";
export const ingredientKey = (id: number) => `/ingredients/${id}` as const;
