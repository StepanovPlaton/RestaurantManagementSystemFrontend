"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import {
  authService,
  clientRegisterFormSchema,
} from "@/entities/session";
import {
  resolveHomePath,
  resolvePostLoginPath,
} from "@/features/auth/resolve-redirect";
import { ApiError } from "@/shared/api/errors";
import {
  mapZodIssuesToFields,
  parseValidationError,
} from "@/shared/lib/map-validation-errors";
import { authStorage } from "@/shared/lib/auth-storage";
import { getAuthorities } from "@/shared/lib/jwt";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const initialForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  login: "",
  password: "",
  email: "",
  phone: "",
};

export function ClientRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const body = {
      ...form,
      middle_name: form.middle_name || undefined,
    };

    const parsed = clientRegisterFormSchema.safeParse(body);
    if (!parsed.success) {
      setFieldErrors(mapZodIssuesToFields(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await authService.registerClient(parsed.data);
      authStorage.setClientTokens(tokens);

      const authorities = getAuthorities(tokens.access_token);
      const home = resolveHomePath(authorities);
      if (!home) {
        authStorage.clearClientTokens();
        toast.error("Неизвестная роль");
        setFormError("Не удалось завершить регистрацию");
        return;
      }

      const redirectTo = resolvePostLoginPath(authorities, null);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const validation = parseValidationError(err);
      if (validation) {
        setFieldErrors(validation);
      } else if (err instanceof ApiError) {
        setFormError(err.message || "Не удалось зарегистрироваться");
      } else {
        setFormError("Не удалось зарегистрироваться");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first_name">Имя</Label>
          <Input
            id="first_name"
            value={form.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
            aria-invalid={Boolean(fieldErrors.first_name)}
          />
          {fieldErrors.first_name && (
            <p className="text-destructive text-sm">{fieldErrors.first_name}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="last_name">Фамилия</Label>
          <Input
            id="last_name"
            value={form.last_name}
            onChange={(e) => updateField("last_name", e.target.value)}
            aria-invalid={Boolean(fieldErrors.last_name)}
          />
          {fieldErrors.last_name && (
            <p className="text-destructive text-sm">{fieldErrors.last_name}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="middle_name">Отчество</Label>
        <Input
          id="middle_name"
          value={form.middle_name}
          onChange={(e) => updateField("middle_name", e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="register-login">Логин</Label>
        <Input
          id="register-login"
          value={form.login}
          onChange={(e) => updateField("login", e.target.value)}
          aria-invalid={Boolean(fieldErrors.login)}
        />
        {fieldErrors.login && (
          <p className="text-destructive text-sm">{fieldErrors.login}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="register-password">Пароль</Label>
        <Input
          id="register-password"
          type="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && (
          <p className="text-destructive text-sm">{fieldErrors.email}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          aria-invalid={Boolean(fieldErrors.phone)}
        />
        {fieldErrors.phone && (
          <p className="text-destructive text-sm">{fieldErrors.phone}</p>
        )}
      </div>
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка регистрации</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Регистрация…" : "Зарегистрироваться"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
