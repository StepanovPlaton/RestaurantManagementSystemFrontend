"use client";

import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-destructive text-sm">{error}</p>
      ) : null}
    </div>
  );
}
