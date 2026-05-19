"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  employeeMeKey,
  employeeService,
  useCurrentEmployee,
} from "@/entities/employee";
import { useRoles } from "@/entities/role";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export function SettingsPage() {
  const isAdmin = useIsAdmin();
  const { data: employee, error, isLoading } = useCurrentEmployee();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFirstName(employee.first_name);
      setLastName(employee.last_name);
      setMiddleName(employee.middle_name ?? "");
      setPhone(employee.phone);
    }
  }, [employee]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    if (!employee) return;
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await employeeService.patchMe({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName || undefined,
        phone,
      });
      await mutate(employeeMeKey);
      toast.success("Профиль обновлён");
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) setFieldErrors(validation);
      else toast.error(getErrorMessage(err, "Не удалось сохранить профиль"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Настройки</h2>
        <p className="text-muted-foreground text-sm">Профиль и справочники</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Профиль</CardTitle>
        </CardHeader>
        <CardContent>
          <AsyncState isLoading={isLoading} error={error}>
            {employee && (
              <form onSubmit={handleProfileSubmit} className="grid max-w-md gap-3">
                <FormField label="Логин">
                  <Input value={employee.login} disabled />
                </FormField>
                <FormField label="Фамилия" error={fieldErrors.last_name}>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </FormField>
                <FormField label="Имя" error={fieldErrors.first_name}>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </FormField>
                <FormField label="Отчество" error={fieldErrors.middle_name}>
                  <Input
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </FormField>
                <FormField label="Телефон" error={fieldErrors.phone}>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FormField>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение…" : "Сохранить профиль"}
                </Button>
              </form>
            )}
          </AsyncState>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Роли в системе</CardTitle>
          </CardHeader>
          <CardContent>
            <AsyncState isLoading={rolesLoading} error={null}>
              {roles && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Название</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.data.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.id}</TableCell>
                        <TableCell>{role.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AsyncState>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
