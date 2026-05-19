export { clientService, ClientService } from "./api/client.service";
export {
  CLIENTS_KEY,
  clientKey,
  clientAddressesKey,
  clientCreateSchema,
  clientPutSchema,
  clientUpdateSchema,
  clientAddressCreateSchema,
  clientDisplayName,
  type Client,
  type ClientAddress,
  type ClientAddressCreate,
  type ClientCreate,
  type ClientPut,
  type ClientUpdate,
} from "./model/schemas";
export { useClient, useClientAddresses, useClients } from "./model/use-clients";
export { useCurrentClient } from "./model/use-current-client";
