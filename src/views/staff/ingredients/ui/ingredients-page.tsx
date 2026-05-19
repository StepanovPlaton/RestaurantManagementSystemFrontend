import { IngredientsTable } from "@/widgets/ingredients-table/ui/ingredients-table";

export function IngredientsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ингредиенты</h2>
        <p className="text-muted-foreground text-sm">
          Справочник ингредиентов для состава блюд
        </p>
      </div>
      <IngredientsTable />
    </div>
  );
}
