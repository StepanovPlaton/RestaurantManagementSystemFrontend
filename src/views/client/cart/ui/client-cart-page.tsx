"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { useCurrentClient } from "@/entities/client";
import { orderCreateSchema, orderService } from "@/entities/order";
import { AddressPicker } from "@/features/checkout";
import {
  useCartActions,
  useCartItems,
  useCartTotalPrice,
} from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { toMediaUrl } from "@/shared/lib/media-url";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

export function ClientCartPage() {
  const router = useRouter();
  const items = useCartItems();
  const totalPrice = useCartTotalPrice();
  const { setQuantity, removeItem, clearCart } = useCartActions();
  const { clientId, isReady } = useCurrentClient();
  const [addressId, setAddressId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCheckout() {
    if (!clientId || addressId == null) {
      toast.error("Выберите адрес доставки");
      return;
    }

    const body = {
      address_id: addressId,
      items: items.map((i) => ({
        dish_id: i.dish_id,
        quantity: i.quantity,
      })),
    };

    const parsed = orderCreateSchema.safeParse(body);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Проверьте корзину");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await orderService.createOrder(parsed.data, {
        authKind: "client",
      });
      clearCart();
      toast.success("Заказ оформлен");
      router.push(`/app/orders/${order.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось оформить заказ"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground text-sm">Корзина пуста</p>
        <Button variant="outline" render={<Link href="/app" />}>
          Перейти в меню
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ul className="flex flex-col gap-3">
        {items.map((line) => (
          <Card key={line.dish_id}>
            <CardContent className="flex gap-3 p-3">
              <div className="bg-muted size-16 shrink-0 overflow-hidden rounded-md">
                {line.photo_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={toMediaUrl(line.photo_path)}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">
                    {line.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => removeItem(line.dish_id)}
                    aria-label="Удалить"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
                <p className="text-sm font-semibold">
                  {formatPrice(line.price * line.quantity)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => setQuantity(line.dish_id, line.quantity - 1)}
                  >
                    <MinusIcon className="size-3.5" />
                  </Button>
                  <span className="text-sm tabular-nums">{line.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => setQuantity(line.dish_id, line.quantity + 1)}
                  >
                    <PlusIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </ul>

      <Separator />

      <div className="flex justify-between text-base font-semibold">
        <span>Итого</span>
        <span>{formatPrice(totalPrice)}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Адрес доставки</h3>
        {isReady && clientId != null ? (
          <AddressPicker
            clientId={clientId}
            value={addressId}
            onChange={setAddressId}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Загрузка профиля…</p>
        )}
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={isSubmitting || addressId == null}
        onClick={handleCheckout}
      >
        {isSubmitting ? "Оформление…" : "Подтвердить заказ"}
      </Button>
    </div>
  );
}
