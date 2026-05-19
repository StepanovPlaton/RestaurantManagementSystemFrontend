import { Suspense } from "react";

import { LoginPage } from "@/views/auth";
import { Skeleton } from "@/shared/ui/skeleton";

export default function LoginRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-svh items-center justify-center p-6">
          <Skeleton className="h-64 w-full max-w-md" />
        </main>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
