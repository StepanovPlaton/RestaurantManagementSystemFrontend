import { httpService } from "@/shared/api";
import type { AuthKind } from "@/shared/lib/jwt";

import {
  clientAddressSchema,
  clientAddressesListSchema,
  clientSchema,
  clientsListSchema,
  type Client,
  type ClientAddress,
  type ClientAddressCreate,
  type ClientCreate,
  type ClientPut,
  type ClientUpdate,
} from "../model/schemas";

type AuthOptions = { authKind?: AuthKind };

export class ClientService {
  getClients(options: AuthOptions = {}) {
    return httpService.get("/clients", clientsListSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  getClient(id: number, options: AuthOptions = {}): Promise<Client> {
    return httpService.get(`/clients/${id}`, clientSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  createClient(body: ClientCreate, options: AuthOptions = {}): Promise<Client> {
    return httpService.post("/clients", body, clientSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  putClient(
    id: number,
    body: ClientPut,
    options: AuthOptions = {},
  ): Promise<Client> {
    return httpService.put(`/clients/${id}`, body, clientSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  patchClient(
    id: number,
    body: ClientUpdate,
    options: AuthOptions = {},
  ): Promise<Client> {
    return httpService.patch(`/clients/${id}`, body, clientSchema, {
      authKind: options.authKind ?? "employee",
    });
  }

  deleteClient(id: number, options: AuthOptions = {}): Promise<void> {
    return httpService.delete(`/clients/${id}`, undefined, {
      authKind: options.authKind ?? "employee",
    });
  }

  getAddresses(clientId: number, options: AuthOptions = {}) {
    return httpService.get(
      `/clients/${clientId}/addresses`,
      clientAddressesListSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  createAddress(
    clientId: number,
    body: ClientAddressCreate,
    options: AuthOptions = {},
  ): Promise<ClientAddress> {
    return httpService.post(
      `/clients/${clientId}/addresses`,
      body,
      clientAddressSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  putAddress(
    clientId: number,
    addressId: number,
    body: ClientAddressCreate,
    options: AuthOptions = {},
  ): Promise<ClientAddress> {
    return httpService.put(
      `/clients/${clientId}/addresses/${addressId}`,
      body,
      clientAddressSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  patchAddress(
    clientId: number,
    addressId: number,
    body: ClientAddressCreate,
    options: AuthOptions = {},
  ): Promise<ClientAddress> {
    return httpService.patch(
      `/clients/${clientId}/addresses/${addressId}`,
      body,
      clientAddressSchema,
      { authKind: options.authKind ?? "employee" },
    );
  }

  deleteAddress(
    clientId: number,
    addressId: number,
    options: AuthOptions = {},
  ): Promise<void> {
    return httpService.delete(
      `/clients/${clientId}/addresses/${addressId}`,
      undefined,
      { authKind: options.authKind ?? "employee" },
    );
  }
}

export const clientService = new ClientService();
