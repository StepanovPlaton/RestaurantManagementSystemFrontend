"use client";

import { Suspense } from "react";

import { ClientLoginForm } from "@/features/auth/client-login";
import { EmployeeLoginForm } from "@/features/auth/employee-login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

function LoginForms() {
  return (
    <Tabs defaultValue="employee" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="employee">Сотрудник</TabsTrigger>
        <TabsTrigger value="client">Клиент</TabsTrigger>
      </TabsList>
      <TabsContent value="employee" className="mt-4">
        <EmployeeLoginForm />
      </TabsContent>
      <TabsContent value="client" className="mt-4">
        <ClientLoginForm />
      </TabsContent>
    </Tabs>
  );
}

export function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Food Rush</CardTitle>
          <CardDescription>Вход в систему</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <LoginForms />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
