import { z } from "zod";

export const loginRequestSchema = z.object({
  login: z.string().min(1, "Логин обязателен"),
  password: z.string().min(1, "Пароль обязателен"),
});

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string().optional(),
  expires_in: z.number().optional(),
});

export const clientRegisterSchema = z.object({
  first_name: z.string().min(1, "Имя обязательно"),
  last_name: z.string().min(1, "Фамилия обязательна"),
  middle_name: z.string().optional(),
  login: z
    .string()
    .min(4, "Длина логина должна быть от 4 до 16 символов")
    .max(16, "Длина логина должна быть от 4 до 16 символов"),
  password: z.string().min(1, "Пароль обязателен"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(1, "Телефон обязателен"),
  avatar_id: z.number().optional(),
});

export const employeeLoginFormSchema = loginRequestSchema;
export const clientLoginFormSchema = loginRequestSchema;

export const clientRegisterFormSchema = clientRegisterSchema;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type ClientRegisterRequest = z.infer<typeof clientRegisterSchema>;
