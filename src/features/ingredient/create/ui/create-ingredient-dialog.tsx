"use client";

import { type FormEvent, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  INGREDIENTS_KEY,
  ingredientCreateSchema,
  ingredientService,
} from "@/entities/ingredient";
import { getErrorMessage, mapValidationErrors } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

export function CreateIngredientDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const parsed = ingredientCreateSchema.safeParse({ name });
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
      await ingredientService.createIngredient(parsed.data);
      await mutate(INGREDIENTS_KEY);
      toast.success("Ингредиент создан");
      setName("");
      setOpen(false);
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) {
        setFieldErrors(validation);
      } else {
        toast.error(getErrorMessage(err, "Не удалось создать ингредиент"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Добавить</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый ингредиент</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField label="Название" htmlFor="ingredient-name" error={fieldErrors.name}>
            <Input
              id="ingredient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение…" : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
