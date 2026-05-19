"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCartIcon } from "lucide-react";

import { useActiveMenus, useMenuDishes } from "@/entities/menu";
import { useCartItemCount } from "@/features/cart";
import { AsyncState } from "@/shared/ui/async-state";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ClientDishCard } from "@/widgets/client/dish-card";

function MenuDishesGrid({ menuId }: { menuId: number }) {
  const { data, error, isLoading } = useMenuDishes(menuId, {
    authKind: "client",
  });

  return (
    <AsyncState
      isLoading={isLoading}
      error={error}
      isEmpty={!data?.data.length}
      emptyMessage="В этом меню пока нет блюд"
    >
      <div className="grid grid-cols-2 gap-3">
        {data?.data.map((dish) => (
          <ClientDishCard key={dish.id} dish={dish} />
        ))}
      </div>
    </AsyncState>
  );
}

export function ClientMenuPage() {
  const { data: menus, error, isLoading } = useActiveMenus({ authKind: "client" });
  const cartCount = useCartItemCount();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuList = menus?.data ?? [];
  const selectedId =
    activeMenuId ?? (menuList[0] ? String(menuList[0].id) : null);

  return (
    <div className="flex flex-col gap-4">
      <AsyncState
        isLoading={isLoading}
        error={error}
        isEmpty={!menuList.length}
        emptyMessage="Нет активных меню"
      >
        {menuList.length > 0 && selectedId && (
          <Tabs
            value={selectedId}
            onValueChange={setActiveMenuId}
            className="gap-4"
          >
            <TabsList className="w-full flex-wrap h-auto">
              {menuList.map((menu) => (
                <TabsTrigger key={menu.id} value={String(menu.id)}>
                  {menu.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {menuList.map((menu) => (
              <TabsContent key={menu.id} value={String(menu.id)}>
                <MenuDishesGrid menuId={menu.id} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </AsyncState>

      {cartCount > 0 && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-4 z-40">
          <Button
            className="w-full shadow-lg"
            render={<Link href="/app/cart" />}
          >
            <ShoppingCartIcon className="size-4" />
            Перейти в корзину ({cartCount})
          </Button>
        </div>
      )}
    </div>
  );
}
