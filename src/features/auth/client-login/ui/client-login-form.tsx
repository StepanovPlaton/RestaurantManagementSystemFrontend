"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { authService, clientLoginFormSchema } from "@/entities/session";
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

export function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = clientLoginFormSchema.safeParse({ login, password });
    if (!parsed.success) {
      setFieldErrors(mapZodIssuesToFields(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await authService.loginClient(parsed.data);
      authStorage.setClientTokens(tokens);

      const authorities = getAuthorities(tokens.access_token);
      const home = resolveHomePath(authorities);
      if (!home) {
        authStorage.clearClientTokens();
        toast.error("Неизвестная роль");
        setFormError("Не удалось определить роль пользователя");
        return;
      }

      const redirectTo = resolvePostLoginPath(
        authorities,
        searchParams.get("from"),
      );
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const validation = parseValidationError(err);
      if (validation) {
        setFieldErrors(validation);
      } else if (err instanceof ApiError) {
        setFormError(err.message || "Неверный логин или пароль");
      } else {
        setFormError("Не удалось войти");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-login">Логин</Label>
        <Input
          id="client-login"
          name="login"
          autoComplete="username"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          aria-invalid={Boolean(fieldErrors.login)}
        />
        {fieldErrors.login && (
          <p className="text-destructive text-sm">{fieldErrors.login}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="client-password">Пароль</Label>
        <Input
          id="client-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && (
          <p className="text-destructive text-sm">{fieldErrors.password}</p>
        )}
      </div>
      {formError && (
        <Alert variant="destructive">
          <AlertTitle>Ошибка входа</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Вход…" : "Войти"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Регистрация
        </Link>
      </p>
    </form>
  );
}
