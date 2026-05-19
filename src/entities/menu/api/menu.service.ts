import { httpService } from "@/shared/api";
import type { AuthKind } from "@/shared/lib/jwt";

import {
  menuSchema,
  menusListSchema,
  menuDishesListSchema,
  menuDishLinkSchema,
  type Menu,
  type MenuCreate,
  type MenusList,
  type MenuUpdate,
} from "../model/schemas";

type AuthOptions = { authKind?: AuthKind };

export class MenuService {
  getMenus(
    isActive?: boolean,
    options: AuthOptions = {},
  ): Promise<MenusList> {
    const query =
      isActive !== undefined ? `?is_active=${isActive}` : "";
    return httpService.get(`/menus${query}`, menusListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  getMenu(id: number, options: AuthOptions = {}): Promise<Menu> {
    return httpService.get(`/menus/${id}`, menuSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  createMenu(body: MenuCreate, options: AuthOptions = {}): Promise<Menu> {
    return httpService.post("/menus", body, menuSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  updateMenu(
    id: number,
    body: MenuUpdate,
    options: AuthOptions = {},
  ): Promise<Menu> {
    return httpService.patch(`/menus/${id}`, body, menuSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  deleteMenu(id: number, options: AuthOptions = {}): Promise<void> {
    return httpService.delete(`/menus/${id}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }

  getMenuDishes(menuId: number, options: AuthOptions = {}) {
    return httpService.get(`/menus/${menuId}/dishes`, menuDishesListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  addDishToMenu(
    menuId: number,
    dishId: number,
    options: AuthOptions = {},
  ) {
    return httpService.post(
      `/menus/${menuId}/dishes`,
      { dish_id: dishId },
      menuDishLinkSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  removeDishFromMenu(
    menuId: number,
    dishId: number,
    options: AuthOptions = {},
  ): Promise<void> {
    return httpService.delete(`/menus/${menuId}/dishes/${dishId}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }
}

export const menuService = new MenuService();
