import { httpService } from "@/shared/api";
import type { AuthKind } from "@/shared/lib/jwt";

import {
  dishSchema,
  dishesListSchema,
  dishIngredientLinkSchema,
  dishIngredientsListSchema,
  dishPhotoLinkSchema,
  photosListSchema,
  photoSchema,
  type Dish,
  type DishCreate,
  type DishesList,
  type DishUpdate,
  type Photo,
} from "../model/schemas";

type AuthOptions = { authKind?: AuthKind };

export class DishService {
  getDishes(options: AuthOptions = {}): Promise<DishesList> {
    return httpService.get("/dishes", dishesListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  getDish(id: number, options: AuthOptions = {}): Promise<Dish> {
    return httpService.get(`/dishes/${id}`, dishSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  createDish(body: DishCreate, options: AuthOptions = {}): Promise<Dish> {
    return httpService.post("/dishes", body, dishSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  updateDish(
    id: number,
    body: DishUpdate,
    options: AuthOptions = {},
  ): Promise<Dish> {
    return httpService.patch(`/dishes/${id}`, body, dishSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  deleteDish(id: number, options: AuthOptions = {}): Promise<void> {
    return httpService.delete(`/dishes/${id}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }

  getDishIngredients(dishId: number, options: AuthOptions = {}) {
    return httpService.get(
      `/dishes/${dishId}/ingredients`,
      dishIngredientsListSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  addDishIngredient(
    dishId: number,
    ingredientId: number,
    options: AuthOptions = {},
  ) {
    return httpService.post(
      `/dishes/${dishId}/ingredients`,
      { ingredient_id: ingredientId },
      dishIngredientLinkSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  removeDishIngredient(
    dishId: number,
    ingredientId: number,
    options: AuthOptions = {},
  ): Promise<void> {
    return httpService.delete(
      `/dishes/${dishId}/ingredients/${ingredientId}`,
      undefined,
      { authKind: options.authKind ?? "employee" },
    );
  }

  getDishPhotos(dishId: number, options: AuthOptions = {}) {
    return httpService.get(`/dishes/${dishId}/photos`, photosListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  linkDishPhoto(
    dishId: number,
    photoId: number,
    options: AuthOptions = {},
  ) {
    return httpService.post(
      `/dishes/${dishId}/photos`,
      { photo_id: photoId },
      dishPhotoLinkSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  unlinkDishPhoto(
    dishId: number,
    photoId: number,
    options: AuthOptions = {},
  ): Promise<void> {
    return httpService.delete(`/dishes/${dishId}/photos/${photoId}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }

  uploadPhoto(file: File, options: AuthOptions = {}): Promise<Photo> {
    const formData = new FormData();
    formData.append("file", file);
    return httpService.upload("/photos", formData, photoSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  deletePhoto(photoId: number, options: AuthOptions = {}): Promise<void> {
    return httpService.delete(`/photos/${photoId}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }
}

export const dishService = new DishService();
