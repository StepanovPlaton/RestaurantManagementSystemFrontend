"use client";

import { cn } from "@/shared/lib/utils";
import type { TocEntry } from "@/content/help/get-help-document";

type HelpTocProps = {
  entries: TocEntry[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  className?: string;
};

export function HelpToc({
  entries,
  activeId,
  onNavigate,
  className,
}: HelpTocProps) {
  return (
    <nav aria-label="Содержание справки" className={cn("text-sm", className)}>
      <p className="text-muted-foreground mb-3 font-medium">Содержание</p>
      <ul className="space-y-1">
        {entries.length === 0 ? (
          <li className="text-muted-foreground px-2 py-1.5 text-xs">
            Разделы не найдены
          </li>
        ) : null}
        {entries.map((entry, index) => (
          <li key={`${entry.id}-${index}`}>
            <button
              type="button"
              onClick={() => onNavigate(entry.id)}
              className={cn(
                "hover:text-foreground w-full rounded-md px-2 py-1.5 text-left transition-colors",
                entry.level === 3 && "pl-4",
                activeId === entry.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              {entry.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
