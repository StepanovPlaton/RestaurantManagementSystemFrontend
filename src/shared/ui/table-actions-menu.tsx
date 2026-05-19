"use client";

import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type TableActionItem = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
};

type TableActionsMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  extraItems?: TableActionItem[];
};

export function TableActionsMenu({
  onEdit,
  onDelete,
  editLabel = "Изменить",
  deleteLabel = "Удалить",
  extraItems = [],
}: TableActionsMenuProps) {
  if (!onEdit && !onDelete && extraItems.length === 0) return null;

  return (
    <div
      className="flex justify-end"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label="Действия"
          />
        }
      >
        <MoreVerticalIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {extraItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            variant={item.variant === "destructive" ? "destructive" : undefined}
            onClick={item.onClick}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <PencilIcon />
            {editLabel}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2Icon />
            {deleteLabel}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
