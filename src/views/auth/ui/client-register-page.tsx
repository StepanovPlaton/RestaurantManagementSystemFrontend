"use client";

import { ClientRegisterForm } from "@/features/auth/client-register";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function ClientRegisterPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Food Rush</CardTitle>
          <CardDescription>Регистрация клиента</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientRegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
