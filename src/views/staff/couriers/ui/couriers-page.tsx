import { EmployeesTable } from "@/widgets/employees-table/ui/employees-table";
import { ROLE_ID } from "@/shared/config/roles";

export function CouriersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Курьеры</h2>
        <p className="text-muted-foreground text-sm">
          Учётные записи курьеров и статус смены
        </p>
      </div>
      <EmployeesTable
        roleId={ROLE_ID.COURIER}
        title="Курьеры"
        showWorkingToggle
      />
    </div>
  );
}
