"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import { useDishes } from "@/entities/dish";
import {
  MENUS_KEY,
  menuCreateSchema,
  menuDishesKey,
  menuService,
  menuUpdateSchema,
  useMenuDishes,
  type Menu,
} from "@/entities/menu";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/ui/native-select";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";

type MenuFormDialogProps = {
  menu: Menu | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MenuFormDialog({ menu, open, onOpenChange }: MenuFormDialogProps) {
  const isCreate = menu == null;
  const [name, setName] = useState("");
  const [seasonality, setSeasonality] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMenuId, setSavedMenuId] = useState<number | null>(menu?.id ?? null);

  const effectiveId = savedMenuId ?? menu?.id ?? null;
  const { data: menuDishes, mutate: mutateMenuDishes } = useMenuDishes(effectiveId);
  const { data: allDishes } = useDishes();
  const [selectedDishId, setSelectedDishId] = useState("");

  useEffect(() => {
    if (!open) return;
    if (menu) {
      setName(menu.name);
      setSeasonality(menu.seasonality);
      setIsActive(menu.is_active);
      setSavedMenuId(menu.id);
    } else {
      setName("");
      setSeasonality("");
      setIsActive(true);
      setSavedMenuId(null);
    }
    setFieldErrors({});
  }, [open, menu]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const body = { name, seasonality, is_active: isActive };
    const parsed = isCreate
      ? menuCreateSchema.safeParse(body)
      : menuUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreate && !effectiveId) {
        const created = await menuService.createMenu(parsed.data as never);
        setSavedMenuId(created.id);
        toast.success("Меню создано");
      } else if (effectiveId) {
        await menuService.updateMenu(effectiveId, parsed.data);
        toast.success("Меню сохранено");
      }
      await mutate(MENUS_KEY);
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) setFieldErrors(validation);
      else toast.error(getErrorMessage(err, "Не удалось сохранить меню"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddDish() {
    if (!effectiveId || !selectedDishId) return;
    try {
      await menuService.addDishToMenu(effectiveId, Number(selectedDishId));
      await mutateMenuDishes();
      await mutate(menuDishesKey(effectiveId));
      setSelectedDishId("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось добавить блюдо"));
    }
  }

  async function handleRemoveDish(dishId: number) {
    if (!effectiveId) return;
    try {
      await menuService.removeDishFromMenu(effectiveId, dishId);
      await mutateMenuDishes();
      await mutate(menuDishesKey(effectiveId));
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось убрать блюдо"));
    }
  }

  const linkedIds = new Set(menuDishes?.data.map((d) => d.id) ?? []);
  const availableDishes = allDishes?.data.filter((d) => !linkedIds.has(d.id)) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Новое меню" : "Редактирование меню"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField label="Название" error={fieldErrors.name}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Сезонность" error={fieldErrors.seasonality}>
            <Input
              value={seasonality}
              onChange={(e) => setSeasonality(e.target.value)}
            />
          </FormField>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} id="menu-active" />
            <Label htmlFor="menu-active">Активно</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>

        {effectiveId && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">Блюда в меню</p>
            <div className="flex gap-2">
              <NativeSelect
                className="w-full flex-1"
                value={selectedDishId}
                onChange={(e) => setSelectedDishId(e.target.value)}
              >
                <NativeSelectOption value="">Выберите блюдо</NativeSelectOption>
                {availableDishes.map((d) => (
                  <NativeSelectOption key={d.id} value={String(d.id)}>
                    {d.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="button" onClick={handleAddDish}>
                Добавить
              </Button>
            </div>
            <ul className="divide-y rounded-md border">
              {menuDishes?.data.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{d.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDish(d.id)}
                  >
                    Убрать
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
