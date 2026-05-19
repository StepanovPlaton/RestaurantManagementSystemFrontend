"use client";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Skeleton } from "@/shared/ui/skeleton";

type AsyncStateProps = {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  emptyMessage?: string;
  loadingRows?: number;
  children: React.ReactNode;
};

export function AsyncState({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = "Нет данных",
  loadingRows = 5,
  children,
}: AsyncStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Ошибка загрузки</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Неизвестная ошибка"}
        </AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return <>{children}</>;
}
