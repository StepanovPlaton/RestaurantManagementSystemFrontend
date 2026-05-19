import { MenusTable } from "@/widgets/menus-table/ui/menus-table";

export function MenusPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Меню</h2>
        <p className="text-muted-foreground text-sm">Управление меню и привязкой блюд</p>
      </div>
      <MenusTable />
    </div>
  );
}
