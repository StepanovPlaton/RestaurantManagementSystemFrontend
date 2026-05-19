"use client";

import { useState } from "react";
import { mutate } from "swr";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { AddClientAddressDialog } from "@/features/client-profile/add-address";
import {
  clientAddressesKey,
  clientService,
  useClientAddresses,
  useCurrentClient,
} from "@/entities/client";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

export function ManageClientAddresses() {
  const { clientId } = useCurrentClient();
  const { data, isLoading, error } = useClientAddresses(clientId, {
    authKind: "client",
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addresses = data?.data ?? [];

  function openEdit(id: number, text: string) {
    setEditId(id);
    setEditText(text);
  }

  async function saveAddress() {
    if (clientId == null || editId == null || !editText.trim()) {
      toast.error("Укажите адрес");
      return;
    }
    setIsSubmitting(true);
    try {
      await clientService.patchAddress(
        clientId,
        editId,
        { address_text: editText.trim() },
        { authKind: "client" },
      );
      await mutate([clientAddressesKey(clientId), "client"]);
      setEditId(null);
      toast.success("Адрес обновлён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось сохранить адрес"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (clientId == null) {
    return <p className="text-muted-foreground text-sm">Загрузка профиля…</p>;
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загрузка адресов…</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">Не удалось загрузить адреса</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Сохранённых адресов пока нет. Добавьте адрес доставки.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex items-start justify-between gap-2 rounded-md border p-3 text-sm"
            >
              <span className="leading-snug">{addr.address_text}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={() => openEdit(addr.id, addr.address_text)}
                aria-label="Редактировать"
              >
                <PencilIcon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <AddClientAddressDialog clientId={clientId} />

      <Dialog open={editId != null} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать адрес</DialogTitle>
          </DialogHeader>
          <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Адрес доставки"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditId(null)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={saveAddress}
            >
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
