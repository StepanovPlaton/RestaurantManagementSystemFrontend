import { z } from "zod";

import { createListSchema } from "@/shared/api/list-schema";

export const orderStatusSchema = z.object({
  id: z.number(),
  status_name: z.string(),
});

export const orderStatusesListSchema = createListSchema(orderStatusSchema);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUSES_KEY = "/order-statuses";
