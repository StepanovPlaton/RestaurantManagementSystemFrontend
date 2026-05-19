import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

const ingredientInDishSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const priceSchema = z.union([z.number(), z.string()]).transform((v) =>
  typeof v === "string" ? Number(v) : v,
);

export const dishSchema = z.object({
  id: z.number(),
  name: z.string(),
  weight: z.number(),
  calories: z.number(),
  price: priceSchema,
  description: z.string().nullable().optional(),
});

export const dishesListSchema = createListSchema(dishSchema);

export const dishCreateSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  weight: z.coerce.number().positive("Вес должен быть больше 0"),
  calories: z.coerce.number().int().nonnegative("Укажите калории"),
  price: z.coerce.number().positive("Укажите цену"),
  description: z.string().optional(),
});

export const dishUpdateSchema = dishCreateSchema.partial();

export const dishIngredientLinkSchema = z.object({
  dish_id: z.number(),
  ingredient_id: z.number(),
});

export const dishIngredientsListSchema = createListSchema(ingredientInDishSchema);

export const photoSchema = z.object({
  id: z.number(),
  path: z.string(),
});

export const photosListSchema = createListSchema(photoSchema);

export const dishPhotoLinkSchema = z.object({
  dish_id: z.number(),
  photo_id: z.number(),
});

export type Dish = z.infer<typeof dishSchema>;
export type DishesList = z.infer<typeof dishesListSchema>;
export type DishCreate = z.infer<typeof dishCreateSchema>;
export type DishUpdate = z.infer<typeof dishUpdateSchema>;
export type Photo = z.infer<typeof photoSchema>;

export const DISHES_KEY = "/dishes";
export const dishKey = (id: number) => `/dishes/${id}` as const;
export const dishIngredientsKey = (dishId: number) =>
  `/dishes/${dishId}/ingredients` as const;
export const dishPhotosKey = (dishId: number) => `/dishes/${dishId}/photos` as const;
