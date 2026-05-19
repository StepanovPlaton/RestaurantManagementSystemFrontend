"use client";

import {
  COURIER_UI_STEPS,
  toCourierStep,
  type CourierUiStep,
} from "@/entities/order";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";

type OrderStatusStepperProps = {
  currentStatusId: number | null;
  className?: string;
};

function stepIndex(step: CourierUiStep): number {
  return COURIER_UI_STEPS.findIndex((s) => s.key === step);
}

export function OrderStatusStepper({
  currentStatusId,
  className,
}: OrderStatusStepperProps) {
  const currentStep = toCourierStep(currentStatusId);

  if (currentStep === "cancelled") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <Badge variant="secondary" className="w-fit">
          Отменён
        </Badge>
      </div>
    );
  }

  const activeIndex = currentStep != null ? stepIndex(currentStep) : -1;

  return (
    <ol
      className={cn("flex items-center justify-between gap-1", className)}
      aria-label="Статус доставки"
    >
      {COURIER_UI_STEPS.map((step, index) => {
        const isComplete = activeIndex > index;
        const isActive = activeIndex === index;
        const isPending = activeIndex < index;

        return (
          <li
            key={step.key}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                isComplete &&
                  "border-primary bg-primary text-primary-foreground",
                isActive && "border-primary bg-background text-primary",
                isPending && "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "text-center text-xs leading-tight",
                (isComplete || isActive) && "font-medium text-foreground",
                isPending && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
