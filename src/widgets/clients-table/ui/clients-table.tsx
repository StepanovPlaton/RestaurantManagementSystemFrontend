"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { toast } from "sonner";

import {
  CLIENTS_KEY,
  clientDisplayName,
  clientService,
  useClients,
  type Client,
} from "@/entities/client";
import { CreateClientDialog } from "@/features/client/create/ui/create-client-dialog";
import { ClientFormDialog } from "@/features/client/edit/ui/client-form-dialog";
import { clickableTableRowClassName } from "@/shared/lib/table-row";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { formatPhone } from "@/shared/lib/format-phone";
import { useIsAdmin } from "@/shared/lib/use-authorities";
import { AsyncState } from "@/shared/ui/async-state";
import { TableActionsMenu } from "@/shared/ui/table-actions-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type ClientsTableProps = {
  initialClientId?: number | null;
};

export function ClientsTable({ initialClientId = null }: ClientsTableProps) {
  const isAdmin = useIsAdmin();
  const { data, error, isLoading } = useClients();
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openedInitial, setOpenedInitial] = useState(false);

  useEffect(() => {
    if (initialClientId == null || openedInitial || !data?.data) {
      return;
    }
    if (data.data.some((c) => c.id === initialClientId)) {
      setEditingClientId(initialClientId);
      setDialogOpen(true);
      setOpenedInitial(true);
    }
  }, [initialClientId, openedInitial, data]);

  function openEdit(client: Client) {
    setEditingClientId(client.id);
    setDialogOpen(true);
  }

  async function handleDelete(client: Client) {
    if (!confirm(`Удалить клиента ${clientDisplayName(client)}?`)) return;
    try {
      await clientService.deleteClient(client.id);
      await mutate(CLIENTS_KEY);
      toast.success("Клиент удалён");
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось удалить клиента"));
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Клиенты</CardTitle>
        <CreateClientDialog
          onCreated={(id) => {
            setEditingClientId(id);
            setDialogOpen(true);
          }}
        />
      </CardHeader>
      <CardContent>
        <AsyncState
          isLoading={isLoading}
          error={error}
          isEmpty={!data?.data.length}
          emptyMessage="Клиентов пока нет"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((client) => (
                <TableRow
                  key={client.id}
                  className={clickableTableRowClassName}
                  onClick={() => openEdit(client)}
                >
                  <TableCell className="font-medium">
                    {clientDisplayName(client)}
                  </TableCell>
                  <TableCell>{formatPhone(client.phone)}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell className="text-right">
                    <TableActionsMenu
                      onEdit={() => openEdit(client)}
                      onDelete={
                        isAdmin ? () => void handleDelete(client) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AsyncState>
      </CardContent>

      <ClientFormDialog
        clientId={editingClientId}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingClientId(null);
        }}
      />
    </Card>
  );
}
