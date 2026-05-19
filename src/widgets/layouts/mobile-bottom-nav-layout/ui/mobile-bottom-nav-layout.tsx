"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PackageIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";

import { useSessionGuard } from "@/features/auth/session-guard";
import { useCartItemCount } from "@/features/cart";
import type { AuthKind } from "@/shared/lib/jwt";
import { cn } from "@/shared/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive?: (pathname: string) => boolean;
};

type MobileBottomNavLayoutProps = {
  children: React.ReactNode;
  title?: string;
  navItems: NavItem[];
  authKind: AuthKind;
};

function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.isActive) return item.isActive(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function MobileBottomNavLayout({
  children,
  title = "Food Rush",
  navItems,
  authKind,
}: MobileBottomNavLayoutProps) {
  useSessionGuard(authKind);
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))]">
      <header className="flex h-14 shrink-0 items-center border-b px-4">
        <h1 className="text-sm font-semibold">{title}</h1>
      </header>
      <main className="flex flex-1 flex-col p-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)]">
        <ul
          className="grid h-16"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}
        >
          {navItems.map((item) => {
            const active = isNavItemActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex h-full flex-col items-center justify-center gap-1 text-xs",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.badge != null && item.badge > 0 && (
                    <span className="bg-primary text-primary-foreground absolute top-1 right-[calc(50%-1.25rem)] flex size-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-medium">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

const courierNavItems: NavItem[] = [
  { title: "Заказы", href: "/courier/orders", icon: PackageIcon },
  { title: "Профиль", href: "/courier/profile", icon: UserIcon },
];

export function CourierMobileLayout(
  props: Omit<MobileBottomNavLayoutProps, "navItems" | "title" | "authKind">,
) {
  return (
    <MobileBottomNavLayout
      title="Курьер"
      navItems={courierNavItems}
      authKind="employee"
      {...props}
    />
  );
}

function useClientNavItems(): NavItem[] {
  const cartCount = useCartItemCount();
  return [
    {
      title: "Меню",
      href: "/app",
      icon: HomeIcon,
      isActive: (p) => p === "/app" || p.startsWith("/app/dishes"),
    },
    {
      title: "Корзина",
      href: "/app/cart",
      icon: ShoppingCartIcon,
      badge: cartCount,
      isActive: (p) => p === "/app/cart",
    },
    {
      title: "Заказы",
      href: "/app/orders",
      icon: PackageIcon,
      isActive: (p) => p.startsWith("/app/orders"),
    },
    { title: "Профиль", href: "/app/profile", icon: UserIcon },
  ];
}

export function ClientMobileLayout(
  props: Omit<MobileBottomNavLayoutProps, "navItems" | "title" | "authKind">,
) {
  const navItems = useClientNavItems();
  return (
    <MobileBottomNavLayout
      title="Food Rush"
      navItems={navItems}
      authKind="client"
      {...props}
    />
  );
}
