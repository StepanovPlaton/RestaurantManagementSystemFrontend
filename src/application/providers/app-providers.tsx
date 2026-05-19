"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { toast } from "sonner";

import { httpService } from "@/shared/api";
import { ApiError, ValidationError } from "@/shared/api/errors";
import { Toaster } from "@/shared/ui/sonner";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SWRConfig
        value={{
          fetcher: (key: string) => httpService.get(key),
          revalidateOnFocus: false,
          onError: (error: unknown) => {
            if (error instanceof ValidationError) return;
            if (error instanceof ApiError && error.status === 401) return;
            if (error instanceof ApiError) {
              toast.error(error.message);
            } else if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Произошла ошибка");
            }
          },
        }}
      >
        {children}
        <Toaster />
      </SWRConfig>
    </ThemeProvider>
  );
}
