"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  CLIENTS_KEY,
  clientKey,
  clientService,
  clientUpdateSchema,
  useCurrentClient,
} from "@/entities/client";
import {
  getErrorMessage,
  mapValidationErrors,
} from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function EditClientProfileForm() {
  const { client, clientId, isLoading, mutate: mutateClient } = useCurrentClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFirstName(client.first_name);
      setLastName(client.last_name);
      setMiddleName(client.middle_name ?? "");
      setEmail(client.email);
      setPhone(client.phone);
    }
  }, [client]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (clientId == null) {
      toast.error("Профиль недоступен");
      return;
    }

    const body = {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || undefined,
      email,
      phone,
    };

    const parsed = clientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await clientService.patchClient(clientId, parsed.data, {
        authKind: "client",
      });
      await Promise.all([
        mutate([CLIENTS_KEY, "client"]),
        mutate(clientKey(clientId)),
        mutateClient(),
      ]);
      toast.success("Профиль обновлён");
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) {
        setFieldErrors(validation);
      } else {
        toast.error(getErrorMessage(err, "Не удалось сохранить профиль"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загрузка…</p>;
  }

  if (!client) {
    return (
      <p className="text-muted-foreground text-sm">Профиль недоступен</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <FormField label="Имя" error={fieldErrors.first_name}>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
        />
      </FormField>
      <FormField label="Фамилия" error={fieldErrors.last_name}>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />
      </FormField>
      <FormField label="Отчество" error={fieldErrors.middle_name}>
        <Input
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />
      </FormField>
      <FormField label="Email" error={fieldErrors.email}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </FormField>
      <FormField label="Телефон" error={fieldErrors.phone}>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </FormField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Сохранение…" : "Сохранить"}
      </Button>
    </form>
  );
}
