import { Suspense } from "react";

import { ClientsPage } from "@/views/staff/clients/ui/clients-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientsPage />
    </Suspense>
  );
}
