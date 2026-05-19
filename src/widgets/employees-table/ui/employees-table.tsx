"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  employeeService,
  employeesKey,
  useEmployees,
  type Employee,
} from "@/entities/employee";
import { EmployeeFormDialog } from "@/features/employee/form/ui/employee-form-dialog";
import { ROLE_ID } from "@/shared/config/roles";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { formatPhone } from "@/shared/lib/format-phone";
import {
  clickableTableRowClassName,
  stopRowClickPropagation,
} from "@/shared/lib/table-row";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { AsyncState } from "@/shared/ui/async-state";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type EmployeesTableProps = {
  roleId: number;
  title: string;
  showWorkingToggle?: boolean;
};

export function EmployeesTable({
  roleId,
  title,
  showWorkingToggle = false,
}: EmployeesTableProps) {
  const isAdmin = useIsAdmin();
  const { data, error, isLoading } = useEmployees({ role_id: roleId });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const key = employeesKey({ role_id: roleId });

  function openEdit(employee: Employee) {
    setEditing(employee);
    setFormOpen(true);
  }

  async function toggleWorking(employee: Employee, checked: boolean) {
    try {
      await employeeService.updateEmployee(employee.id, { is_working: checked });
      await mutate(key);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить статус"));
    }
  }

  async function handleDelete(employee: Employee) {
    if (!confirm(`Удалить ${employee.last_name}?`)) return;
    try {
      await employeeService.deleteEmployee(employee.id);
      await mutate(key);
      toast.success("Сотрудник удалён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить"));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{title}</CardTitle>
        {isAdmin && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Добавить
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!!data && data.data.length === 0}
          emptyMessage="Нет сотрудников"
        >
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Фамилия</TableHead>
                  <TableHead>Телефон</TableHead>
                  {showWorkingToggle && <TableHead>На смене</TableHead>}
                  {isAdmin && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className={clickableTableRowClassName}
                    onClick={() => openEdit(employee)}
                  >
                    <TableCell>
                      {employee.last_name} {employee.first_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatPhone(employee.phone)}
                    </TableCell>
                    {showWorkingToggle && (
                      <TableCell onClick={stopRowClickPropagation}>
                        <Switch
                          checked={employee.is_working}
                          onCheckedChange={(checked) =>
                            toggleWorking(employee, checked)
                          }
                          disabled={!isAdmin}
                        />
                      </TableCell>
                    )}
                    {isAdmin && (
                      <TableCell className="text-right">
                        <TableActionsMenu
                          onEdit={() => openEdit(employee)}
                          onDelete={() => handleDelete(employee)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AsyncState>
      </CardContent>

      <EmployeeFormDialog
        employee={editing}
        roleId={roleId}
        title={editing ? `Редактировать` : `Новый сотрудник`}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </Card>
  );
}
