"use client";

import Link from "next/link";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";

import { useCourierEmployee } from "@/entities/employee";
import { logout } from "@/features/auth/logout";
import { EditProfileForm } from "@/features/courier/edit-profile";
import { ToggleWorking } from "@/features/courier/toggle-working";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

function displayName(
  employee:
    | { first_name: string; last_name: string; middle_name?: string | null }
    | undefined,
  login: string | null,
): string {
  if (employee) {
    return [employee.last_name, employee.first_name, employee.middle_name]
      .filter(Boolean)
      .join(" ");
  }
  return login ?? "Курьер";
}

export function CourierProfilePage() {
  const { employee, login, isLoading } = useCourierEmployee();
  const name = displayName(employee, login);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="bg-muted flex size-20 items-center justify-center rounded-full text-2xl font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          {employee?.phone && (
            <p className="text-muted-foreground text-sm">{employee.phone}</p>
          )}
          {employee?.is_working && (
            <p className="text-primary mt-1 text-xs font-medium">
              На смене сегодня
            </p>
          )}
        </div>
      </div>

      <ToggleWorking />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Личные данные</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && <EditProfileForm />}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Link
            href="/courier/help"
            className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-sm transition-colors"
          >
            Справка
            <ChevronRightIcon className="size-4 opacity-50" />
          </Link>
          <Separator />
          <Link
            href="/courier/about"
            className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-sm transition-colors"
          >
            О разработчиках
            <ChevronRightIcon className="size-4 opacity-50" />
          </Link>
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => logout()}
      >
        <LogOutIcon className="size-4" />
        Выйти
      </Button>
    </div>
  );
}
