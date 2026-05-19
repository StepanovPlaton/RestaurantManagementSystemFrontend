"use client";

import { useSearchParams } from "next/navigation";

import { ClientsTable } from "@/widgets/clients-table/ui/clients-table";

export function ClientsPage() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");
  const initialClientId = clientParam ? Number(clientParam) : null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Клиенты</h2>
        <p className="text-muted-foreground text-sm">
          Справочник клиентов и адресов доставки
        </p>
      </div>
      <ClientsTable
        initialClientId={
          initialClientId != null && !Number.isNaN(initialClientId)
            ? initialClientId
            : null
        }
      />
    </div>
  );
}
