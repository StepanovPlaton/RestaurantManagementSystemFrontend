"use client";

import Link from "next/link";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

const TEAM = [
  {
    name: "Степанов Платон",
    telegram: "https://t.me/StepanovPlaton",
    handle: "@StepanovPlaton",
  },
  {
    name: "Карпин Дмитрий",
    telegram: "https://t.me/kArpIkkkkkkkkk",
    handle: "@kArpIkkkkkkkkk",
  },
  {
    name: "Тростянская Елизавета",
    telegram: "https://t.me/trostyanskayayaya",
    handle: "@trostyanskayayaya",
  },
] as const;

export type AboutDevelopersPageProps = {
  helpHref: string;
  backHref?: string;
  variant?: "desktop" | "mobile";
};

export function AboutDevelopersPage({
  helpHref,
  backHref,
  variant = "desktop",
}: AboutDevelopersPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-2xl flex-col gap-6",
        variant === "mobile" && "-mx-4 -mt-4 px-4",
      )}
    >
      <div className="flex flex-col gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "-ml-2 w-fit gap-1",
            })}
          >
            <ArrowLeftIcon className="size-4" />
            Назад
          </Link>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            О разработчиках
          </h1>
          <p className="text-muted-foreground text-sm">
            Команда разработки Food Rush
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Учебное заведение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium">Самарский университет</p>
          <p className="text-muted-foreground">Группа 6303-020302D</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">О проекте</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm leading-relaxed">
          <p>
            <strong className="text-foreground">Food Rush</strong> — система
            управления рестораном с доставкой: веб-приложение для администратора
            и менеджера, мобильные интерфейсы для курьера и клиента. Проект
            разработан в рамках учебной программы и демонстрирует полный цикл
            заказа от меню до доставки.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Участники команды</h2>
        <ul className="flex flex-col gap-3">
          {TEAM.map((member) => (
            <li key={member.telegram}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {member.handle}
                    </p>
                  </div>
                  <a
                    href={member.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "gap-1",
                    })}
                  >
                    Telegram
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={helpHref}
        className={buttonVariants({
          variant: "secondary",
          className: "w-full sm:w-auto",
        })}
      >
        Открыть справку
      </Link>
    </div>
  );
}
