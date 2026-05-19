export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (path === "/login" || path === "/register") return;
  window.location.href = "/login";
}
