import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

const roleInEmployeeSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const employeeSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  middle_name: z.string().nullable().optional(),
  login: z.string(),
  role_id: z.number(),
  role: roleInEmployeeSchema,
  phone: z.string(),
  avatar_id: z.number().nullable().optional(),
  is_working: z.boolean(),
});

export const employeesListSchema = createListSchema(employeeSchema);

export const employeeCreateSchema = z.object({
  first_name: z.string().min(1, "Укажите имя"),
  last_name: z.string().min(1, "Укажите фамилию"),
  middle_name: z.string().optional(),
  login: z.string().min(4, "Логин от 4 символов").max(16),
  password: z.string().min(1, "Укажите пароль"),
  role_id: z.number(),
  phone: z.string().min(1, "Укажите телефон"),
  avatar_id: z.number().optional(),
  is_working: z.boolean(),
});

export const employeeUpdateSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  middle_name: z.string().optional(),
  login: z.string().min(4).max(16).optional(),
  password: z.string().optional(),
  role_id: z.number().optional(),
  phone: z.string().optional(),
  avatar_id: z.number().nullable().optional(),
  is_working: z.boolean().optional(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeesList = z.infer<typeof employeesListSchema>;
export type EmployeeCreate = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;

export function employeesKey(params?: {
  role_id?: number;
  is_working?: boolean;
}) {
  if (!params?.role_id && params?.is_working === undefined) {
    return "/employees";
  }
  const search = new URLSearchParams();
  if (params.role_id != null) search.set("role_id", String(params.role_id));
  if (params.is_working !== undefined) {
    search.set("is_working", String(params.is_working));
  }
  return `/employees?${search.toString()}`;
}

export const employeeKey = (id: number) => `/employees/${id}` as const;

export const employeeMeKey = "/employees/me" as const;
