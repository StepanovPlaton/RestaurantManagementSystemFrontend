export { dishService, DishService } from "./api/dish.service";
export {
  DISHES_KEY,
  dishKey,
  dishIngredientsKey,
  dishPhotosKey,
  dishCreateSchema,
  dishUpdateSchema,
  type Dish,
  type DishCreate,
  type DishUpdate,
  type Photo,
} from "./model/schemas";
export {
  useDish,
  useDishes,
  useDishIngredients,
  useDishPhotos,
} from "./model/use-dishes";
