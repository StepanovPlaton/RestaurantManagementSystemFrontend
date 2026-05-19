"use client";

import Link from "next/link";
import { ChevronRightIcon, LogOutIcon } from "lucide-react";

import { clientDisplayName, useCurrentClient } from "@/entities/client";
import { useAvatar } from "@/entities/employee/model/use-avatar";
import { EditClientProfileForm } from "@/features/client-profile/edit-profile";
import { ManageClientAddresses } from "@/features/client-profile/manage-addresses";
import { logout } from "@/features/auth/logout";
import { toMediaUrl } from "@/shared/lib/media-url";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

function profileInitials(
  client:
    | {
        first_name: string;
        last_name: string;
        middle_name?: string | null;
      }
    | undefined,
  login: string | null,
): string {
  if (client) {
    const name = clientDisplayName(client);
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }
  return (login?.charAt(0) ?? "?").toUpperCase();
}

export function ClientProfilePage() {
  const { client, login, isLoading } = useCurrentClient();
  const { data: avatar } = useAvatar(client?.avatar_id ?? null, {
    authKind: "client",
  });

  const name = client ? clientDisplayName(client) : (login ?? "Клиент");
  const initials = profileInitials(client, login);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="bg-muted relative flex size-20 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold">
          {avatar?.path ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toMediaUrl(avatar.path)}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{isLoading ? "…" : name}</h2>
          {client?.email && (
            <p className="text-muted-foreground text-sm">{client.email}</p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Личные данные</CardTitle>
        </CardHeader>
        <CardContent>
          <EditClientProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Адреса доставки</CardTitle>
        </CardHeader>
        <CardContent>
          <ManageClientAddresses />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Link
            href="/app/help"
            className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-sm transition-colors"
          >
            Справка
            <ChevronRightIcon className="size-4 opacity-50" />
          </Link>
          <Separator />
          <Link
            href="/app/about"
            className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-sm transition-colors"
          >
            О разработчиках
            <ChevronRightIcon className="size-4 opacity-50" />
          </Link>
        </CardContent>
      </Card>

      <Separator />

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => logout()}
      >
        <span className="flex items-center gap-2">
          <LogOutIcon className="size-4" />
          Выйти
        </span>
        <ChevronRightIcon className="size-4 opacity-50" />
      </Button>
    </div>
  );
}
