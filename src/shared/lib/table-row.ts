import type { KeyboardEvent, MouseEvent } from "react";

import { cn } from "@/shared/lib/utils";

export const clickableTableRowClassName = cn(
  "cursor-pointer transition-colors hover:bg-muted/50",
);

export function stopRowClickPropagation(event: MouseEvent | KeyboardEvent) {
  event.stopPropagation();
}
