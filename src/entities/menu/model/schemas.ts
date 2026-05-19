import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

const dishInMenuSchema = z.object({
  id: z.number(),
  name: z.string(),
  weight: z.number(),
  calories: z.number(),
  price: z.union([z.number(), z.string()]),
  description: z.string().nullable().optional(),
});

export const menuSchema = z.object({
  id: z.number(),
  name: z.string(),
  seasonality: z.string(),
  is_active: z.boolean(),
});

export const menusListSchema = createListSchema(menuSchema);

export const menuCreateSchema = z.object({
  name: z.string().min(1, "Укажите название"),
  seasonality: z.string().min(1, "Укажите сезонность"),
  is_active: z.boolean(),
});

export const menuUpdateSchema = menuCreateSchema.partial();

export const menuDishesListSchema = createListSchema(dishInMenuSchema);

export const menuDishLinkSchema = z.object({
  menu_id: z.number(),
  dish_id: z.number(),
});

export type Menu = z.infer<typeof menuSchema>;
export type MenusList = z.infer<typeof menusListSchema>;
export type MenuCreate = z.infer<typeof menuCreateSchema>;
export type MenuUpdate = z.infer<typeof menuUpdateSchema>;

export const MENUS_KEY = "/menus";
export const ACTIVE_MENUS_KEY = "/menus?is_active=true";
export const menuKey = (id: number) => `/menus/${id}` as const;
export const menuDishesKey = (menuId: number) => `/menus/${menuId}/dishes` as const;
