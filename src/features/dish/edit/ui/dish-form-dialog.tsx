"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  DISHES_KEY,
  dishCreateSchema,
  dishIngredientsKey,
  dishPhotosKey,
  dishService,
  dishUpdateSchema,
  useDishIngredients,
  useDishPhotos,
  type Dish,
} from "@/entities/dish";
import { useIngredients } from "@/entities/ingredient";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { toMediaUrl } from "@/shared/lib/media-url";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

type DishFormDialogProps = {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (dish: Dish) => void;
};

export function DishFormDialog({
  dish,
  open,
  onOpenChange,
  onSaved,
}: DishFormDialogProps) {
  const isCreate = dish == null;
  const dishId = dish?.id ?? null;

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedDishId, setSavedDishId] = useState<number | null>(dishId);

  const effectiveId = savedDishId ?? dishId;
  const { data: ingredientsInDish, mutate: mutateIngredients } =
    useDishIngredients(effectiveId);
  const { data: photosInDish, mutate: mutatePhotos } = useDishPhotos(effectiveId);
  const { data: allIngredients } = useIngredients();

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (dish) {
      setName(dish.name);
      setWeight(String(dish.weight));
      setCalories(String(dish.calories));
      setPrice(String(dish.price));
      setDescription(dish.description ?? "");
      setSavedDishId(dish.id);
    } else {
      setName("");
      setWeight("");
      setCalories("");
      setPrice("");
      setDescription("");
      setSavedDishId(null);
    }
    setFieldErrors({});
  }, [open, dish]);

  async function handleSubmitMain(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const body = {
      name,
      weight,
      calories,
      price,
      description: description || undefined,
    };

    const parsed = isCreate
      ? dishCreateSchema.safeParse(body)
      : dishUpdateSchema.safeParse(body);

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
      let result: Dish;
      if (isCreate && !effectiveId) {
        result = await dishService.createDish(parsed.data as never);
        setSavedDishId(result.id);
        toast.success("Блюдо создано — можно добавить состав и фото");
      } else if (effectiveId) {
        result = await dishService.updateDish(effectiveId, parsed.data);
        toast.success("Блюдо сохранено");
      } else {
        return;
      }
      await mutate(DISHES_KEY);
      onSaved?.(result);
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) setFieldErrors(validation);
      else toast.error(getErrorMessage(err, "Не удалось сохранить блюдо"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddIngredient() {
    if (!effectiveId || !selectedIngredientId) return;
    try {
      await dishService.addDishIngredient(
        effectiveId,
        Number(selectedIngredientId),
      );
      await mutateIngredients();
      await mutate(dishIngredientsKey(effectiveId));
      setSelectedIngredientId("");
      toast.success("Ингредиент добавлен");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось добавить ингредиент"));
    }
  }

  async function handleRemoveIngredient(ingredientId: number) {
    if (!effectiveId) return;
    try {
      await dishService.removeDishIngredient(effectiveId, ingredientId);
      await mutateIngredients();
      await mutate(dishIngredientsKey(effectiveId));
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить ингредиент"));
    }
  }

  async function handleUploadPhoto(file: File) {
    if (!effectiveId) {
      toast.error("Сначала сохраните основные данные блюда");
      return;
    }
    try {
      const photo = await dishService.uploadPhoto(file);
      await dishService.linkDishPhoto(effectiveId, photo.id);
      await mutatePhotos();
      await mutate(dishPhotosKey(effectiveId));
      toast.success("Фото загружено");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось загрузить фото"));
    }
  }

  async function handleRemovePhoto(photoId: number) {
    if (!effectiveId) return;
    try {
      await dishService.unlinkDishPhoto(effectiveId, photoId);
      await dishService.deletePhoto(photoId);
      await mutatePhotos();
      await mutate(dishPhotosKey(effectiveId));
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить фото"));
    }
  }

  const linkedIds = new Set(ingredientsInDish?.data.map((i) => i.id) ?? []);
  const availableIngredients =
    allIngredients?.data.filter((i) => !linkedIds.has(i.id)) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Новое блюдо" : "Редактирование блюда"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="main">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="main">Основное</TabsTrigger>
            <TabsTrigger value="ingredients" disabled={!effectiveId}>
              Состав
            </TabsTrigger>
            <TabsTrigger value="photos" disabled={!effectiveId}>
              Фото
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main">
            <form onSubmit={handleSubmitMain} className="grid gap-3 pt-2">
              <FormField label="Название" error={fieldErrors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Вес (г)" error={fieldErrors.weight}>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </FormField>
                <FormField label="Калории" error={fieldErrors.calories}>
                  <Input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Цена (₽)" error={fieldErrors.price}>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </FormField>
              <FormField label="Описание" error={fieldErrors.description}>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormField>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Закрыть
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение…" : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="ingredients" className="space-y-3 pt-2">
            <div className="flex gap-2">
              <NativeSelect
                className="w-full flex-1"
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
              >
                <NativeSelectOption value="">Выберите ингредиент</NativeSelectOption>
                {availableIngredients.map((ing) => (
                  <NativeSelectOption key={ing.id} value={String(ing.id)}>
                    {ing.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="button" onClick={handleAddIngredient}>
                Добавить
              </Button>
            </div>
            <ul className="divide-y rounded-md border">
              {ingredientsInDish?.data.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span>{ing.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveIngredient(ing.id)}
                  >
                    Убрать
                  </Button>
                </li>
              ))}
              {ingredientsInDish?.data.length === 0 && (
                <li className="text-muted-foreground px-3 py-4 text-center text-sm">
                  Состав пуст
                </li>
              )}
            </ul>
          </TabsContent>

          <TabsContent value="photos" className="space-y-3 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUploadPhoto(file);
                e.target.value = "";
              }}
            />
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              Загрузить фото
            </Button>
            <div className="grid grid-cols-2 gap-2">
              {photosInDish?.data.map((photo) => (
                <div key={photo.id} className="relative rounded-md border p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toMediaUrl(photo.path)}
                    alt=""
                    className="aspect-video w-full rounded object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => handleRemovePhoto(photo.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
