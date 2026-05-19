"use client";

import { type FormEvent, useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  CLIENTS_KEY,
  clientAddressesKey,
  clientDisplayName,
  clientKey,
  clientPutSchema,
  clientService,
  useClient,
  useClientAddresses,
} from "@/entities/client";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { AsyncState } from "@/shared/ui/async-state";
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
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

type ClientFormDialogProps = {
  clientId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientFormDialog({
  clientId,
  open,
  onOpenChange,
}: ClientFormDialogProps) {
  const isAdmin = useIsAdmin();
  const { data: client, error, isLoading, mutate: mutateClient } = useClient(
    open && clientId != null ? clientId : null,
  );
  const { data: addresses, mutate: mutateAddresses } = useClientAddresses(
    open && clientId != null ? clientId : null,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [editingAddressText, setEditingAddressText] = useState("");

  useEffect(() => {
    if (!open || !client) return;
    setFirstName(client.first_name);
    setLastName(client.last_name);
    setMiddleName(client.middle_name ?? "");
    setLogin(client.login);
    setPassword("");
    setEmail(client.email);
    setPhone(client.phone);
    setFieldErrors({});
    setNewAddress("");
    setEditingAddressId(null);
  }, [open, client]);

  async function refreshClient() {
    if (clientId == null) return;
    await Promise.all([
      mutate(CLIENTS_KEY),
      mutate(clientKey(clientId)),
      mutate(clientAddressesKey(clientId)),
      mutateClient(),
      mutateAddresses(),
    ]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (clientId == null) return;

    setFieldErrors({});
    const body = {
      first_name: firstName,
      last_name: lastName,
      middle_name: middleName || undefined,
      login,
      password: password || undefined,
      email,
      phone,
      avatar_id: client?.avatar_id ?? null,
    };

    const parsed = clientPutSchema.safeParse(body);
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
      const payload = { ...parsed.data };
      if (!payload.password) {
        const { password: _p, ...rest } = payload;
        await clientService.patchClient(clientId, rest);
      } else {
        await clientService.putClient(clientId, payload);
      }
      await refreshClient();
      toast.success("Клиент сохранён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось сохранить клиента"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddAddress() {
    if (clientId == null || !newAddress.trim()) return;

    try {
      await clientService.createAddress(clientId, {
        address_text: newAddress.trim(),
      });
      setNewAddress("");
      await refreshClient();
      toast.success("Адрес добавлен");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось добавить адрес"));
    }
  }

  async function handleSaveAddress(addressId: number) {
    if (clientId == null || !editingAddressText.trim()) return;

    try {
      await clientService.patchAddress(clientId, addressId, {
        address_text: editingAddressText.trim(),
      });
      setEditingAddressId(null);
      await refreshClient();
      toast.success("Адрес обновлён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось обновить адрес"));
    }
  }

  async function handleDeleteAddress(addressId: number) {
    if (clientId == null || !isAdmin) return;
    if (!confirm("Удалить адрес?")) return;

    try {
      await clientService.deleteAddress(clientId, addressId);
      await refreshClient();
      toast.success("Адрес удалён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить адрес"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {client ? clientDisplayName(client) : "Редактирование клиента"}
          </DialogTitle>
        </DialogHeader>

        <AsyncState isLoading={isLoading} error={error}>
          {client && (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <FormField label="Имя" error={fieldErrors.first_name}>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormField>
              <FormField label="Фамилия" error={fieldErrors.last_name}>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormField>
              <FormField label="Отчество" error={fieldErrors.middle_name}>
                <Input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </FormField>
              <FormField label="Логин" error={fieldErrors.login}>
                <Input value={login} onChange={(e) => setLogin(e.target.value)} />
              </FormField>
              <FormField label="Новый пароль" error={fieldErrors.password}>
                <Input
                  type="password"
                  placeholder="Оставьте пустым, чтобы не менять"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormField>
              <FormField label="Email" error={fieldErrors.email}>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
              <FormField label="Телефон" error={fieldErrors.phone}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormField>

              <Separator />

              <div className="space-y-3">
                <Label>Адреса доставки</Label>
                <ul className="space-y-2">
                  {addresses?.data.map((addr) => (
                    <li
                      key={addr.id}
                      className="rounded-md border p-2 text-sm"
                    >
                      {editingAddressId === addr.id ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            value={editingAddressText}
                            onChange={(e) =>
                              setEditingAddressText(e.target.value)
                            }
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                void handleSaveAddress(addr.id)
                              }
                            >
                              Сохранить
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingAddressId(null)}
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <span>{addr.address_text}</span>
                          <div className="flex shrink-0 gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingAddressId(addr.id);
                                setEditingAddressText(addr.address_text);
                              }}
                            >
                              Изменить
                            </Button>
                            {isAdmin && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() =>
                                  void handleDeleteAddress(addr.id)
                                }
                              >
                                Удалить
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                  {addresses?.data.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Адресов нет
                    </p>
                  )}
                </ul>
                <div className="flex gap-2">
                  <Input
                    placeholder="Новый адрес"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleAddAddress()}
                    disabled={!newAddress.trim()}
                  >
                    Добавить
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Закрыть
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Сохранение…" : "Сохранить"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </AsyncState>
      </DialogContent>
    </Dialog>
  );
}
