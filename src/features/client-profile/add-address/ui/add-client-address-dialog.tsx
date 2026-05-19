"use client";

import { useState } from "react";
import { mutate } from "swr";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import {
  clientAddressCreateSchema,
  clientAddressesKey,
  clientService,
  type ClientAddress,
} from "@/entities/client";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

type AddClientAddressDialogProps = {
  clientId: number;
  onCreated?: (address: ClientAddress) => void;
  trigger?: React.ReactNode;
};

export function AddClientAddressDialog({
  clientId,
  onCreated,
  trigger,
}: AddClientAddressDialogProps) {
  const [open, setOpen] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setAddressText("");
  }

  async function handleSubmit() {
    const parsed = clientAddressCreateSchema.safeParse({
      address_text: addressText.trim(),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Укажите адрес");
      return;
    }

    setIsSubmitting(true);
    try {
      const address = await clientService.createAddress(
        clientId,
        parsed.data,
        { authKind: "client" },
      );
      await mutate([clientAddressesKey(clientId), "client"]);
      toast.success("Адрес добавлен");
      onCreated?.(address);
      handleOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось добавить адрес"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
            />
          }
        >
          <PlusIcon className="size-4" />
          Добавить адрес
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый адрес доставки</DialogTitle>
        </DialogHeader>
        <Input
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          placeholder="Город, улица, дом, квартира"
          autoFocus
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !addressText.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Сохранение…" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
