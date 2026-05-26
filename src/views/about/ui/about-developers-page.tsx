"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

import { buttonVariants } from "@/shared/ui/button";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

const UNIVERSITY = "Самарский университет";
const INSTITUTE = "институт информатики и кибернетики";
const DISCIPLINE = "Программная инженерия";
const PROJECT_TOPIC =
  "Приложение для удаленного создания заказов в системе ресторана и контроля их исполнения";
const GROUP = "6303-020302D";
const YEAR = "2026";

const TEAM = [
  {
    initials: "П.А. Степанов",
    name: "Степанов Платон",
    telegram: "https://t.me/StepanovPlaton",
    handle: "@StepanovPlaton",
  },
  {
    initials: "Д.А. Карпин",
    name: "Карпин Дмитрий",
    telegram: "https://t.me/kArpIkkkkkkkkk",
    handle: "@kArpIkkkkkkkkk",
  },
  {
    initials: "Е.М. Тростянская",
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
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col",
        variant === "mobile" && "-mx-4 -mt-4",
      )}
    >
      {backHref ? (
        <div className="px-4 pt-4">
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
        </div>
      ) : null}

      <section
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-6 bg-[#DEE7F7] px-6 py-12 text-center",
          variant === "desktop" ? "min-h-[calc(100vh-8rem)] rounded-lg" : "min-h-[calc(100dvh-6rem)]",
        )}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <p className="text-base font-bold leading-snug">
            {UNIVERSITY}
            <br />
            {INSTITUTE}
          </p>

          <p className="text-base font-bold leading-snug">
            Курсовой проект по дисциплине &laquo;{DISCIPLINE}&raquo;
          </p>

          <p className="text-base font-bold leading-snug">
            по теме &laquo;{PROJECT_TOPIC}&raquo;
          </p>

          <div className="pt-2">
            <p className="text-base font-bold">
              Разработчики (обучающиеся группы {GROUP}):
            </p>
            <ul className="mt-3 space-y-1 text-base">
              {TEAM.map((member) => (
                <li key={member.telegram}>{member.initials}</li>
              ))}
            </ul>
          </div>

          <p className="pt-2 text-base">{YEAR} г.</p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-border/60 bg-[#DEE7F7] px-8 shadow-none hover:bg-[#d0dcf0]"
          onClick={() => setAboutOpen(true)}
        >
          О системе
        </Button>
      </section>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>О системе</DialogTitle>
            <DialogDescription className="sr-only">
              Сведения о приложении Food Rush и контакты команды разработки
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-left text-sm leading-relaxed">
                <p>
                  <strong>Food Rush</strong> — система управления рестораном с
                  доставкой: веб-приложение для администратора и менеджера,
                  мобильные интерфейсы для курьера и клиента. Проект разработан
                  в рамках учебной программы и демонстрирует полный цикл заказа
                  от меню до доставки.
                </p>

                <div>
                  <p className="mb-2 font-medium">Контакты разработчиков</p>
                  <ul className="space-y-2">
                    {TEAM.map((member) => (
                      <li
                        key={member.telegram}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          {member.name}{" "}
                          <span className="text-muted-foreground">
                            ({member.handle})
                          </span>
                        </span>
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
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={helpHref}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full",
                  })}
                  onClick={() => setAboutOpen(false)}
                >
                  Открыть справку
                </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
