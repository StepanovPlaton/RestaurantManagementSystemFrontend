"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  CLIENTS_KEY,
  clientCreateSchema,
  clientService,
} from "@/entities/client";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type CreateClientDialogProps = {
  onCreated?: (clientId: number) => void;
};

export function CreateClientDialog({ onCreated }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setMiddleName("");
    setLogin("");
    setPassword("");
    setEmail("");
    setPhone("");
    setFieldErrors({});
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const body = {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || undefined,
      login,
      password,
      email,
      phone,
    };

    const parsed = clientCreateSchema.safeParse(body);
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
      const created = await clientService.createClient(parsed.data);
      await mutate(CLIENTS_KEY);
      toast.success("Клиент создан");
      setOpen(false);
      onCreated?.(created.id);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось создать клиента"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Добавить клиента</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый клиент</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FormField label="Имя" error={fieldErrors.first_name}>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </FormField>
          <FormField label="Фамилия" error={fieldErrors.last_name}>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </FormField>
          <FormField label="Отчество" error={fieldErrors.middle_name}>
            <Input
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </FormField>
          <FormField label="Логин" error={fieldErrors.login}>
            <Input value={login} onChange={(e) => setLogin(e.target.value)} />
          </FormField>
          <FormField label="Пароль" error={fieldErrors.password}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <FormField label="Email" error={fieldErrors.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Телефон" error={fieldErrors.phone}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
