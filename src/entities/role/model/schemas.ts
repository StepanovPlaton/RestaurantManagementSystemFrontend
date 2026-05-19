import { z } from "zod";

export const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const rolesListSchema = z.object({
  data: z.array(roleSchema),
  total: z.number(),
});

export type Role = z.infer<typeof roleSchema>;
export type RolesList = z.infer<typeof rolesListSchema>;
