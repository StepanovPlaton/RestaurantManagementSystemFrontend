import { authStorage } from "@/shared/lib/auth-storage";
import { getAuthorities } from "@/shared/lib/jwt";

import { resolveHomePath } from "./resolve-home-path";

export function resolveSessionHome(): string | null {
  const clientToken = authStorage.getClientAccessToken();
  if (clientToken) {
    const clientAuthorities = getAuthorities(clientToken);
    if (clientAuthorities.includes("CLIENT")) {
      return resolveHomePath(clientAuthorities);
    }
  }

  const employeeToken = authStorage.getEmployeeAccessToken();
  if (employeeToken) {
    return resolveHomePath(getAuthorities(employeeToken));
  }

  return null;
}
