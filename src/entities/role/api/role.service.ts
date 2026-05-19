import { httpService } from "@/shared/api";

import { rolesListSchema, type RolesList } from "../model/schemas";

export class RoleService {
  getRoles(): Promise<RolesList> {
    return httpService.get("/roles", rolesListSchema, { authKind: "employee" });
  }
}

export const roleService = new RoleService();
