"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  employeeCreateSchema,
  employeeService,
  employeeUpdateSchema,
  employeesKey,
  type Employee,
} from "@/entities/employee";
import { ROLE_ID } from "@/shared/config/roles";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { toMediaUrl } from "@/shared/lib/media-url";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";

type EmployeeFormDialogProps = {
  employee: Employee | null;
  roleId: number;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EmployeeFormDialog({
  employee,
  roleId,
  title,
  open,
  onOpenChange,
}: EmployeeFormDialogProps) {
  const isAdmin = useIsAdmin();
  const isCreate = employee == null;
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [avatarId, setAvatarId] = useState<number | undefined>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setFirstName(employee.first_name);
      setLastName(employee.last_name);
      setMiddleName(employee.middle_name ?? "");
      setPhone(employee.phone);
      setLogin(employee.login);
      setPassword("");
      setIsWorking(employee.is_working);
      setAvatarId(employee.avatar_id ?? undefined);
      setAvatarPreview(
        employee.avatar_id ? `/avatars/${employee.avatar_id}` : null,
      );
    } else {
      setFirstName("");
      setLastName("");
      setMiddleName("");
      setPhone("");
      setLogin("");
      setPassword("");
      setIsWorking(roleId === ROLE_ID.COURIER);
      setAvatarId(undefined);
      setAvatarPreview(null);
    }
    setFieldErrors({});
  }, [open, employee, roleId]);

  async function handleAvatarUpload(file: File) {
    try {
      const avatar = await employeeService.uploadAvatar(file);
      setAvatarId(avatar.id);
      setAvatarPreview(toMediaUrl(avatar.path));
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось загрузить аватар"));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isAdmin) return;
    setFieldErrors({});

    const body = {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || undefined,
      phone,
      login,
      password: password || undefined,
      role_id: roleId,
      avatar_id: avatarId,
      is_working: isWorking,
    };

    const parsed = isCreate
      ? employeeCreateSchema.safeParse({ ...body, password })
      : employeeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreate) {
        await employeeService.createEmployee(parsed.data as never);
        toast.success("Сотрудник создан");
      } else {
        await employeeService.updateEmployee(employee.id, parsed.data);
        toast.success("Сотрудник обновлён");
      }
      await mutate(employeesKey({ role_id: roleId }));
      onOpenChange(false);
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) setFieldErrors(validation);
      else toast.error(getErrorMessage(err, "Не удалось сохранить"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <FormField label="Фамилия" error={fieldErrors.last_name}>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField label="Имя" error={fieldErrors.first_name}>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
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
          <FormField label="Логин" error={fieldErrors.login}>
            <Input value={login} onChange={(e) => setLogin(e.target.value)} />
          </FormField>
          <FormField
            label={isCreate ? "Пароль" : "Пароль (оставьте пустым, чтобы не менять)"}
            error={fieldErrors.password}
          >
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          {roleId === ROLE_ID.COURIER && (
            <div className="flex items-center gap-2">
              <Switch
                id="is-working"
                checked={isWorking}
                onCheckedChange={setIsWorking}
              />
              <Label htmlFor="is-working">На смене</Label>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Аватар</Label>
            {avatarPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview.startsWith("http") ? avatarPreview : toMediaUrl(avatarPreview)}
                alt=""
                className="h-16 w-16 rounded-full object-cover"
              />
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleAvatarUpload(file);
              }}
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              Загрузить аватар
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || !isAdmin}>
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
