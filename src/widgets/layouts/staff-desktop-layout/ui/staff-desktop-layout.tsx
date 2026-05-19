"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  ChefHatIcon,
  InfoIcon,
  CroissantIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserCircleIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from "lucide-react";

import { useSessionGuard } from "@/features/auth/session-guard";

import { useAuthorities } from "@/shared/lib/use-authorities";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";

import { StaffSidebarThemeToggle } from "./staff-sidebar-theme-toggle";
import { StaffSidebarUser } from "./staff-sidebar-user";

type StaffDesktopLayoutProps = {
  children: React.ReactNode;
  title?: string;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const restaurantItems: NavItem[] = [
  { title: "Заказы", href: "/staff/orders", icon: ShoppingBagIcon },
  { title: "Клиенты", href: "/staff/clients", icon: UserCircleIcon },
  { title: "Меню", href: "/staff/menus", icon: LayoutDashboardIcon },
  { title: "Блюда", href: "/staff/dishes", icon: UtensilsCrossedIcon },
  { title: "Ингредиенты", href: "/staff/ingredients", icon: ChefHatIcon },
];

const staffItems: NavItem[] = [
  { title: "Менеджеры", href: "/staff/managers", icon: UsersIcon, adminOnly: true },
  { title: "Курьеры", href: "/staff/couriers", icon: TruckIcon, adminOnly: true },
];

const bottomItems: NavItem[] = [
  { title: "Настройки", href: "/staff/settings", icon: SettingsIcon },
  { title: "Справка", href: "/staff/help", icon: BookOpenIcon },
  { title: "О разработчиках", href: "/staff/about", icon: InfoIcon },
];

function SidebarNavItem({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} tooltip={item.title}>
        <Link href={item.href} className="flex w-full items-center gap-2">
          <item.icon className="size-4 shrink-0" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function NavGroup({
  label,
  items,
  pathname,
  isAdmin,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  isAdmin: boolean;
}) {
  const visible = items.filter((item) => !item.adminOnly || isAdmin);
  if (visible.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visible.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={
                pathname === item.href || pathname.startsWith(`${item.href}/`)
              }
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function StaffDesktopLayout({
  children,
  title = "Food Rush",
}: StaffDesktopLayoutProps) {
  useSessionGuard("employee");
  const pathname = usePathname();
  const authorities = useAuthorities();
  const isAdmin = authorities.includes("ADMIN");

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset" className="flex flex-col">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
          <Link
            href="/staff/orders"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <CroissantIcon className="size-5" />
            <span>Food Rush</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <NavGroup
            label="Ресторан"
            items={restaurantItems}
            pathname={pathname}
            isAdmin={isAdmin}
          />
          <NavGroup
            label="Сотрудники"
            items={staffItems}
            pathname={pathname}
            isAdmin={isAdmin}
          />
        </SidebarContent>

        <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
          <SidebarMenu>
            {bottomItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                isActive={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </SidebarMenu>
          <StaffSidebarThemeToggle />
          <SidebarSeparator />
          <StaffSidebarUser />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">{title}</h1>
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
