"use client";

import { useRouter } from "next/navigation";
import { LogOutIcon, MoreVerticalIcon } from "lucide-react";

import { useCurrentEmployee } from "@/entities/employee";
import { useAvatar } from "@/entities/employee/model/use-avatar";
import { logout } from "@/features/auth/logout";
import { toMediaUrl } from "@/shared/lib/media-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";

function getInitials(firstName: string, lastName: string): string {
  return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase();
}

export function StaffSidebarUser() {
  const router = useRouter();
  const { data: employee, isLoading } = useCurrentEmployee();
  const { data: avatar } = useAvatar(employee?.avatar_id);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading) {
    return <Skeleton className="h-14 w-full rounded-lg" />;
  }

  if (!employee) {
    return null;
  }

  const displayName = [employee.first_name, employee.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-sidebar p-2">
      <Avatar size="sm" className="rounded-md">
        {avatar?.path ? (
          <AvatarImage src={toMediaUrl(avatar.path)} alt="" />
        ) : null}
        <AvatarFallback className="rounded-md text-xs">
          {getInitials(employee.first_name, employee.last_name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="text-muted-foreground truncate text-xs">{employee.login}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Меню пользователя" />
          }
        >
          <MoreVerticalIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top">
          <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
