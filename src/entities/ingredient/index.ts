export { ingredientService, IngredientService } from "./api/ingredient.service";
export {
  INGREDIENTS_KEY,
  ingredientKey,
  ingredientCreateSchema,
  ingredientUpdateSchema,
  type Ingredient,
  type IngredientCreate,
  type IngredientUpdate,
} from "./model/schemas";
export { useIngredient, useIngredients } from "./model/use-ingredients";
