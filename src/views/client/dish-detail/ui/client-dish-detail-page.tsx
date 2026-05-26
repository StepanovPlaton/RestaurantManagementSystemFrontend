"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { useDish, useDishIngredients, useDishPhotos } from "@/entities/dish";
import { useCartActions } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { toMediaUrl } from "@/shared/lib/media-url";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { DishImagePlaceholder } from "@/shared/ui/dish-image-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

export function ClientDishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dishId = Number(params.id);
  const validId = Number.isFinite(dishId) && dishId > 0;

  const { data: dish, error, isLoading } = useDish(validId ? dishId : null, {
    authKind: "client",
  });
  const { data: ingredients } = useDishIngredients(validId ? dishId : null, {
    authKind: "client",
  });
  const { data: photos } = useDishPhotos(validId ? dishId : null, {
    authKind: "client",
  });

  const { addItem } = useCartActions();
  const [quantity, setQuantity] = useState(1);

  const photoPath = photos?.data[0]?.path;

  function handleAddToCart() {
    if (!dish) return;
    addItem(
      {
        dish_id: dish.id,
        name: dish.name,
        price: dish.price,
        photo_path: photoPath,
      },
      quantity,
    );
    toast.success("Добавлено в корзину");
    router.back();
  }

  if (!validId) {
    return <p className="text-muted-foreground text-sm">Некорректный ID блюда</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit -ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeftIcon className="size-4" />
        Назад
      </Button>

      <AsyncState isLoading={isLoading} error={error}>
        {dish && (
          <>
            <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
              {photoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toMediaUrl(photoPath)}
                  alt={dish.name}
                  className="size-full object-cover"
                />
              ) : (
                <DishImagePlaceholder />
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{dish.name}</h2>
              <p className="text-lg font-semibold">{formatPrice(dish.price)}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {dish.weight} г · {dish.calories} ккал
              </p>
            </div>

            {dish.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Описание</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {dish.description}
                </CardContent>
              </Card>
            )}

            {(ingredients?.data.length ?? 0) > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ингредиенты</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm">
                    {ingredients?.data.map((ing) => (
                      <li key={ing.id}>{ing.name}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Количество</span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Уменьшить"
                >
                  <MinusIcon className="size-4" />
                </Button>
                <span className="w-6 text-center font-medium tabular-nums">
                  {quantity}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Увеличить"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>

            <Button type="button" className="w-full" onClick={handleAddToCart}>
              В корзину · {formatPrice(dish.price * quantity)}
            </Button>
          </>
        )}
      </AsyncState>
    </div>
  );
}
