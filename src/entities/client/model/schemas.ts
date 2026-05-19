import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

export const clientSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  middle_name: z.string().nullable().optional(),
  login: z.string(),
  email: z.string(),
  phone: z.string(),
  avatar_id: z.number().nullable().optional(),
});

export const clientsListSchema = createListSchema(clientSchema);

export const clientCreateSchema = z.object({
  first_name: z.string().min(1, "Укажите имя"),
  last_name: z.string().min(1, "Укажите фамилию"),
  middle_name: z.string().optional(),
  login: z.string().min(4, "Логин от 4 символов").max(16),
  password: z.string().min(1, "Укажите пароль"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(1, "Укажите телефон"),
  avatar_id: z.number().optional(),
});

export const clientPutSchema = z.object({
  first_name: z.string().min(1, "Укажите имя"),
  last_name: z.string().min(1, "Укажите фамилию"),
  middle_name: z.string().optional(),
  login: z.string().min(4).max(16),
  password: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(1),
  avatar_id: z.number().nullable().optional(),
});

export const clientUpdateSchema = clientPutSchema.partial();

export const clientAddressSchema = z.object({
  id: z.number(),
  client_id: z.number(),
  address_text: z.string(),
});

export const clientAddressesListSchema = createListSchema(clientAddressSchema);

export const clientAddressCreateSchema = z.object({
  address_text: z.string().min(1, "Укажите адрес"),
});

export const clientAddressUpdateSchema = clientAddressCreateSchema;

export type Client = z.infer<typeof clientSchema>;
export type ClientCreate = z.infer<typeof clientCreateSchema>;
export type ClientPut = z.infer<typeof clientPutSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;
export type ClientAddress = z.infer<typeof clientAddressSchema>;
export type ClientAddressCreate = z.infer<typeof clientAddressCreateSchema>;

export const CLIENTS_KEY = "/clients";
export const clientKey = (id: number) => `/clients/${id}` as const;
export const clientAddressesKey = (clientId: number) =>
  `/clients/${clientId}/addresses` as const;

export function clientDisplayName(client: {
  first_name: string;
  last_name: string;
  middle_name?: string | null;
}): string {
  return [client.last_name, client.first_name, client.middle_name]
    .filter(Boolean)
    .join(" ");
}
