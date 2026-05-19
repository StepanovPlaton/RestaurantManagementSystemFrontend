import { httpService } from "@/shared/api";

import {
  orderStatusSchema,
  orderStatusesListSchema,
  type OrderStatus,
} from "../model/schemas";

export class OrderStatusService {
  getOrderStatuses() {
    return httpService.get("/order-statuses", orderStatusesListSchema, {
      authKind: "employee",
    });
  }

  getOrderStatus(id: number): Promise<OrderStatus> {
    return httpService.get(`/order-statuses/${id}`, orderStatusSchema, {
      authKind: "employee",
    });
  }
}

export const orderStatusService = new OrderStatusService();
