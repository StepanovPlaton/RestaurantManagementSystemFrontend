"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  DISHES_KEY,
  dishIngredientsKey,
  dishService,
  useDishes,
  type Dish,
} from "@/entities/dish";
import { DishFormDialog } from "@/features/dish/edit/ui/dish-form-dialog";
import { clickableTableRowClassName } from "@/shared/lib/table-row";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { AsyncState } from "@/shared/ui/async-state";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export function DishesTable() {
  const { data, error, isLoading } = useDishes();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [counts, setCounts] = useState<Record<number, number>>({});

  async function loadCount(dishId: number) {
    if (counts[dishId] !== undefined) return;
    try {
      const res = await dishService.getDishIngredients(dishId);
      setCounts((prev) => ({ ...prev, [dishId]: res.total }));
    } catch {
      setCounts((prev) => ({ ...prev, [dishId]: 0 }));
    }
  }

  function openEdit(dish: Dish) {
    setEditingDish(dish);
    setFormOpen(true);
  }

  async function handleDelete(dish: Dish) {
    if (!confirm(`Удалить блюдо «${dish.name}»?`)) return;
    try {
      await dishService.deleteDish(dish.id);
      await mutate(DISHES_KEY);
      toast.success("Блюдо удалено");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить блюдо"));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Блюда</CardTitle>
        <Button
          onClick={() => {
            setEditingDish(null);
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
          emptyMessage="Нет блюд"
        >
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Ингредиенты</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((dish) => {
                  if (counts[dish.id] === undefined) void loadCount(dish.id);
                  return (
                    <TableRow
                      key={dish.id}
                      className={clickableTableRowClassName}
                      onClick={() => openEdit(dish)}
                    >
                      <TableCell>{dish.name}</TableCell>
                      <TableCell>{dish.price} ₽</TableCell>
                      <TableCell>
                        {counts[dish.id] !== undefined ? counts[dish.id] : "…"}
                      </TableCell>
                      <TableCell className="text-right">
                        <TableActionsMenu
                          onEdit={() => openEdit(dish)}
                          onDelete={() => handleDelete(dish)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </AsyncState>
      </CardContent>

      <DishFormDialog
        dish={editingDish}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingDish(null);
            void mutate(DISHES_KEY);
          }
        }}
      />
    </Card>
  );
}
