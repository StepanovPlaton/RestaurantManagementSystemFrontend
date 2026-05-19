"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ListIcon } from "lucide-react";

import type { TocEntry } from "@/content/help/get-help-document";
import { HelpToc } from "@/widgets/help-toc";
import { Button, buttonVariants } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { cn } from "@/shared/lib/utils";

import { HelpMarkdown } from "./help-markdown";

export type HelpDocumentPageProps = {
  markdown: string;
  toc: TocEntry[];
  aboutHref: string;
  backHref?: string;
  variant?: "desktop" | "mobile";
};

export function HelpDocumentPage({
  markdown,
  toc,
  aboutHref,
  backHref,
  variant = "desktop",
}: HelpDocumentPageProps) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const [tocOpen, setTocOpen] = useState(false);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
    setTocOpen(false);
  }, []);

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>("[data-help-heading]");
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.getAttribute("data-help-heading");
        if (top) setActiveId(top);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [markdown]);

  return (
    <div
      className={cn(
        variant === "mobile" && "-mx-4 -mt-4 px-4",
        "scroll-smooth",
      )}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "-ml-2 gap-1",
              })}
            >
              <ArrowLeftIcon className="size-4" />
              Назад
            </Link>
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Справка</h1>
            <p className="text-muted-foreground text-sm">
              Руководство пользователя Food Rush
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Sheet open={tocOpen} onOpenChange={setTocOpen}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setTocOpen(true)}
            >
              <ListIcon className="size-4" />
              Содержание
            </Button>
            <SheetContent
              side="left"
              className="w-[min(100%,20rem)] overflow-y-auto"
            >
              <SheetHeader>
                <SheetTitle>Содержание</SheetTitle>
              </SheetHeader>
              <div className="mt-4 px-1">
                <HelpToc
                  entries={toc}
                  activeId={activeId}
                  onNavigate={scrollToId}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Link
            href={aboutHref}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            О разработчиках
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10 xl:grid-cols-[minmax(0,18rem)_minmax(0,48rem)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <HelpToc entries={toc} activeId={activeId} onNavigate={scrollToId} />
          </div>
        </aside>
        <div className="min-w-0">
          <HelpMarkdown markdown={markdown} toc={toc} />
        </div>
      </div>
    </div>
  );
}
