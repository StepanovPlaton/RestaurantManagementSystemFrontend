"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  INGREDIENTS_KEY,
  ingredientUpdateSchema,
  ingredientService,
  type Ingredient,
} from "@/entities/ingredient";
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

type EditIngredientDialogProps = {
  ingredient: Ingredient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditIngredientDialog({
  ingredient,
  open,
  onOpenChange,
}: EditIngredientDialogProps) {
  const [name, setName] = useState(ingredient.name);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setName(ingredient.name);
  }, [open, ingredient.name]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const parsed = ingredientUpdateSchema.safeParse({ name });
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
      await ingredientService.updateIngredient(ingredient.id, parsed.data);
      await mutate(INGREDIENTS_KEY);
      toast.success("Ингредиент обновлён");
      onOpenChange(false);
    } catch (err) {
      const validation = mapValidationErrors(err);
      if (validation) {
        setFieldErrors(validation);
      } else {
        toast.error(getErrorMessage(err, "Не удалось обновить ингредиент"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать ингредиент</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField label="Название" htmlFor="edit-ingredient-name" error={fieldErrors.name}>
            <Input
              id="edit-ingredient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
