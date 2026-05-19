"use client";

import Link from "next/link";
import { MinusIcon, PlusIcon } from "lucide-react";

import { useCartStore } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { parsePrice } from "@/shared/lib/parse-price";
import { toMediaUrl } from "@/shared/lib/media-url";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

type ClientDishCardProps = {
  dish: {
    id: number;
    name: string;
    price: number | string;
    description?: string | null;
  };
  photoPath?: string | null;
};

export function ClientDishCard({ dish, photoPath }: ClientDishCardProps) {
  const price = parsePrice(dish.price);
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.dish_id === dish.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  function handleAdd() {
    addItem({
      dish_id: dish.id,
      name: dish.name,
      price,
      photo_path: photoPath,
    });
  }

  return (
    <Card className="overflow-hidden">
      <Link href={`/app/dishes/${dish.id}`} className="block">
        <div className="bg-muted relative aspect-[4/3] w-full">
          {photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={toMediaUrl(photoPath)}
              alt={dish.name}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              Нет фото
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex flex-col gap-2 p-3">
        <Link href={`/app/dishes/${dish.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-tight">
            {dish.name}
          </h3>
        </Link>
        <p className="text-sm font-semibold">{formatPrice(price)}</p>
        {quantity === 0 ? (
          <Button type="button" size="sm" className="w-full" onClick={handleAdd}>
            В корзину
          </Button>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => setQuantity(dish.id, quantity - 1)}
              aria-label="Уменьшить"
            >
              <MinusIcon className="size-4" />
            </Button>
            <span className="text-sm font-medium tabular-nums">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8 shrink-0"
              onClick={() => setQuantity(dish.id, quantity + 1)}
              aria-label="Увеличить"
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
