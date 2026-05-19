"use client";

import { useState } from "react";

import { useIngredients, type Ingredient } from "@/entities/ingredient";
import { CreateIngredientDialog } from "@/features/ingredient/create/ui/create-ingredient-dialog";
import { DeleteIngredientDialog } from "@/features/ingredient/delete/ui/delete-ingredient-dialog";
import { EditIngredientDialog } from "@/features/ingredient/update/ui/edit-ingredient-dialog";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  clickableTableRowClassName,
} from "@/shared/lib/table-row";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

export function IngredientsTable() {
  const { data, error, isLoading } = useIngredients();
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [deleting, setDeleting] = useState<Ingredient | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Ингредиенты</CardTitle>
        <CreateIngredientDialog />
      </CardHeader>
      <CardContent>
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!!data && data.data.length === 0}
          emptyMessage="Нет ингредиентов"
        >
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((ingredient) => (
                  <TableRow
                    key={ingredient.id}
                    className={clickableTableRowClassName}
                    onClick={() => setEditing(ingredient)}
                  >
                    <TableCell>{ingredient.id}</TableCell>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell className="text-right">
                      <TableActionsMenu
                        onEdit={() => setEditing(ingredient)}
                        onDelete={() => setDeleting(ingredient)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AsyncState>
      </CardContent>

      {editing && (
        <EditIngredientDialog
          ingredient={editing}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteIngredientDialog
          ingredient={deleting}
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
        />
      )}
    </Card>
  );
}
