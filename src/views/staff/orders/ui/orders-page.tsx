import { OrdersTable } from "@/widgets/orders-table/ui/orders-table";

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Заказы</h2>
        <p className="text-muted-foreground text-sm">
          Мониторинг и обработка заказов клиентов
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
