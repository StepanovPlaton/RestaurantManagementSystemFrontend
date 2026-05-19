"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { MENUS_KEY, menuService, useMenus, type Menu } from "@/entities/menu";
import { MenuFormDialog } from "@/features/menu/edit/ui/menu-form-dialog";
import {
  clickableTableRowClassName,
  stopRowClickPropagation,
} from "@/shared/lib/table-row";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { AsyncState } from "@/shared/ui/async-state";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Switch } from "@/shared/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export function MenusTable() {
  const { data, error, isLoading } = useMenus();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Menu | null>(null);

  function openEdit(menu: Menu) {
    setEditing(menu);
    setFormOpen(true);
  }

  async function toggleActive(menu: Menu, checked: boolean) {
    try {
      await menuService.updateMenu(menu.id, { is_active: checked });
      await mutate(MENUS_KEY);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить меню"));
    }
  }

  async function handleDelete(menu: Menu) {
    if (!confirm(`Удалить меню «${menu.name}»?`)) return;
    try {
      await menuService.deleteMenu(menu.id);
      await mutate(MENUS_KEY);
      toast.success("Меню удалено");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить меню"));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Меню</CardTitle>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Добавить
        </Button>
      </CardHeader>
      <CardContent>
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!!data && data.data.length === 0}
          emptyMessage="Нет меню"
        >
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Сезонность</TableHead>
                  <TableHead>Активно</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((menu) => (
                  <TableRow
                    key={menu.id}
                    className={clickableTableRowClassName}
                    onClick={() => openEdit(menu)}
                  >
                    <TableCell>{menu.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{menu.seasonality}</Badge>
                    </TableCell>
                    <TableCell onClick={stopRowClickPropagation}>
                      <Switch
                        checked={menu.is_active}
                        onCheckedChange={(checked) => toggleActive(menu, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <TableActionsMenu
                        onEdit={() => openEdit(menu)}
                        onDelete={() => handleDelete(menu)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AsyncState>
      </CardContent>

      <MenuFormDialog
        menu={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </Card>
  );
}
