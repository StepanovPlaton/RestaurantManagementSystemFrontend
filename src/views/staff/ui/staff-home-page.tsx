"use client";

import Link from "next/link";

import { useIsAdmin } from "@/shared/lib/use-authorities";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const baseLinks = [
  {
    href: "/staff/orders",
    title: "Заказы",
    desc: "Обработка и назначение курьеров",
  },
  {
    href: "/staff/clients",
    title: "Клиенты",
    desc: "Справочник клиентов и адресов",
  },
  {
    href: "/staff/ingredients",
    title: "Ингредиенты",
    desc: "Справочник ингредиентов",
  },
  { href: "/staff/dishes", title: "Блюда", desc: "Каталог блюд" },
  { href: "/staff/menus", title: "Меню", desc: "Меню и состав" },
  { href: "/staff/settings", title: "Настройки", desc: "Профиль" },
];

const adminLinks = [
  { href: "/staff/managers", title: "Менеджеры", desc: "Персонал" },
  { href: "/staff/couriers", title: "Курьеры", desc: "Курьеры и смены" },
];

export function StaffHomePage() {
  const isAdmin = useIsAdmin();
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Панель управления
        </h2>
        <p className="text-muted-foreground text-sm">
          Food Rush — администрирование ресторана
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Card key={link.href}>
            <CardHeader>
              <CardTitle className="text-base">{link.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">{link.desc}</p>
              <Button render={<Link href={link.href} />} variant="outline" size="sm">
                Открыть
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
