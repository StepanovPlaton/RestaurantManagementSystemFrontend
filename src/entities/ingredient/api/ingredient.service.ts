import { httpService } from "@/shared/api";

import {
  ingredientSchema,
  ingredientsListSchema,
  type Ingredient,
  type IngredientCreate,
  type IngredientsList,
  type IngredientUpdate,
} from "../model/schemas";

export class IngredientService {
  getIngredients(): Promise<IngredientsList> {
    return httpService.get("/ingredients", ingredientsListSchema, {
      authKind: "employee",
    });
  }

  getIngredient(id: number): Promise<Ingredient> {
    return httpService.get(`/ingredients/${id}`, ingredientSchema, {
      authKind: "employee",
    });
  }

  createIngredient(body: IngredientCreate): Promise<Ingredient> {
    return httpService.post("/ingredients", body, ingredientSchema, {
      authKind: "employee",
    });
  }

  updateIngredient(id: number, body: IngredientUpdate): Promise<Ingredient> {
    return httpService.patch(`/ingredients/${id}`, body, ingredientSchema, {
      authKind: "employee",
    });
  }

  deleteIngredient(id: number): Promise<void> {
    return httpService.delete(`/ingredients/${id}`, undefined, {
      authKind: "employee",
    });
  }
}

export const ingredientService = new IngredientService();
