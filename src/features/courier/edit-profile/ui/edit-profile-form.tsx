"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  employeeMeKey,
  employeeService,
  useCourierEmployee,
} from "@/entities/employee";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function EditProfileForm() {
  const {
    employee,
    employeeId,
    isLoading,
    isApiBlocked,
    mutate: mutateEmployee,
  } = useCourierEmployee();

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (employeeId == null) {
      toast.error("Профиль недоступен");
      return;
    }

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
      await mutateEmployee();
      toast.success("Профиль обновлён");
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) {
        setFieldErrors(validation);
      } else {
        const message = getErrorMessage(err, "Не удалось сохранить профиль");
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-sm">Загрузка профиля…</p>
    );
  }

  if (isApiBlocked && !employee) {
    return (
      <p className="text-muted-foreground text-sm">
        Редактирование профиля будет доступно после обновления API для роли
        курьера.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Имя" error={fieldErrors.first_name}>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={isSubmitting}
        />
      </FormField>
      <FormField label="Фамилия" error={fieldErrors.last_name}>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={isSubmitting}
        />
      </FormField>
      <FormField label="Отчество" error={fieldErrors.middle_name}>
        <Input
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          disabled={isSubmitting}
        />
      </FormField>
      <FormField label="Телефон" error={fieldErrors.phone}>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
        />
      </FormField>
      <Button type="submit" disabled={isSubmitting || employeeId == null}>
        {isSubmitting ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  );
}
