"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { resolveSessionHome } from "@/features/auth/resolve-redirect";
import { Skeleton } from "@/shared/ui/skeleton";

export function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const home = resolveSessionHome();
    router.replace(home ?? "/login");
  }, [router]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Skeleton className="h-8 w-48" />
    </main>
  );
}
