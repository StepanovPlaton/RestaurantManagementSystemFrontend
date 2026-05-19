import { DishesTable } from "@/widgets/dishes-table/ui/dishes-table";

export function DishesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Блюда</h2>
        <p className="text-muted-foreground text-sm">Каталог блюд ресторана</p>
      </div>
      <DishesTable />
    </div>
  );
}
