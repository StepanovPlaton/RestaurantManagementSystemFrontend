"use client";

import { useClientAddresses } from "@/entities/client";
import { AddClientAddressDialog } from "@/features/client-profile/add-address";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";

type AddressPickerProps = {
  clientId: number;
  value: number | null;
  onChange: (addressId: number) => void;
};

export function AddressPicker({ clientId, value, onChange }: AddressPickerProps) {
  const { data, isLoading, error, mutate } = useClientAddresses(clientId, {
    authKind: "client",
  });

  const addresses = data?.data ?? [];

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
          Нет сохранённых адресов. Добавьте адрес для оформления заказа.
        </p>
      ) : (
        <RadioGroup
          value={value != null ? String(value) : undefined}
          onValueChange={(v) => onChange(Number(v))}
          className="gap-3"
        >
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start gap-2">
              <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} />
              <Label
                htmlFor={`addr-${addr.id}`}
                className="cursor-pointer font-normal leading-snug"
              >
                {addr.address_text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      <AddClientAddressDialog
        clientId={clientId}
        onCreated={(address) => {
          void mutate();
          onChange(address.id);
        }}
      />
    </div>
  );
}
