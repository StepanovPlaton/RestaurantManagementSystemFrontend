export { orderService, OrderService } from "./api/order.service";
export {
  CANCELLED_STATUS_ID,
  COOKING_STATUS_ID,
  DELIVERED_STATUS_ID,
  DELIVERING_STATUS_ID,
  NEW_STATUS_ID,
  ORDER_STATUS_CATALOG,
  statusIdToLabel,
  statusIdToManagerTableLabel,
  statusIdToName,
  statusOptionsFromCatalog,
  type OrderStatusName,
} from "./lib/order-status-catalog";
export {
  COURIER_UI_STEPS,
  courierListBadgeLabel,
  courierStepLabel,
  getCourierStatusActionLabel,
  getNextCourierStatusId,
  isCourierStatusTerminal,
  toCourierStep,
  type CourierUiStep,
} from "./lib/courier-status-ui";
export {
  CLIENT_UI_STEPS,
  canClientCancel,
  canClientConfirmDelivery,
  clientStepLabel,
  isClientOrderTerminal,
  toClientStep,
  type ClientUiStep,
} from "./lib/client-status-ui";
export { getCurrentStatusId } from "./lib/derive-order-status";
export {
  orderAddressDisplay,
  orderClientDisplayName,
} from "./lib/order-display";
export {
  ORDERS_KEY,
  ordersKey,
  orderKey,
  orderItemsKey,
  orderItemKey,
  orderStatusHistoryKey,
  orderCreateSchema,
  orderItemCreateSchema,
  orderItemUpdateSchema,
  orderStatusHistoryCreateSchema,
  orderUpdateSchema,
  type OrderCreate,
  type Order,
  type OrderItem,
  type OrderItemCreate,
  type OrderItemUpdate,
  type OrderStatusHistory,
  type OrderStatusHistoryCreate,
  type OrderUpdate,
} from "./model/schemas";
export {
  useOrder,
  useOrderItems,
  useOrders,
  useOrderStatusHistory,
} from "./model/use-orders";
