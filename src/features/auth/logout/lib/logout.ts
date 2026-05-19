import { authStorage } from "@/shared/lib/auth-storage";
import { redirectToLogin } from "@/shared/lib/redirect-to-login";

export function logout(): void {
  authStorage.clearAll();
  redirectToLogin();
}

export { redirectToLogin };
