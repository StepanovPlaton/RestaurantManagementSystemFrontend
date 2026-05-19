"use client";

import { useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  INGREDIENTS_KEY,
  ingredientService,
  type Ingredient,
} from "@/entities/ingredient";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

type DeleteIngredientDialogProps = {
  ingredient: Ingredient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteIngredientDialog({
  ingredient,
  open,
  onOpenChange,
}: DeleteIngredientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await ingredientService.deleteIngredient(ingredient.id);
      await mutate(INGREDIENTS_KEY);
      toast.success("Ингредиент удалён");
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить ингредиент"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить ингредиент?</AlertDialogTitle>
          <AlertDialogDescription>
            «{ingredient.name}» будет удалён без возможности восстановления.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Удаление…" : "Удалить"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
