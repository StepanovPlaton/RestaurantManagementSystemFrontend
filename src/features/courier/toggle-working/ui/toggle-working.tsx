"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  employeeService,
  useCourierEmployee,
} from "@/entities/employee";
import { getErrorMessage } from "@/shared/lib/map-validation-errors";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

type ToggleWorkingProps = {
  className?: string;
};

export function ToggleWorking({ className }: ToggleWorkingProps) {
  const {
    employee,
    employeeId,
    isApiBlocked,
    isLoading,
    mutate: mutateEmployee,
  } = useCourierEmployee();

  const [isWorking, setIsWorking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setIsWorking(employee.is_working);
    }
  }, [employee]);

  async function handleToggle(checked: boolean) {
    if (employeeId == null) {
      toast.error("Не удалось определить профиль курьера");
      return;
    }

    const previous = isWorking;
    setIsWorking(checked);
    setIsSaving(true);

    try {
      await employeeService.patchMe({ is_working: checked });
      await mutateEmployee();
      toast.success(checked ? "Вы на смене" : "Смена завершена");
    } catch (err) {
      setIsWorking(previous);
      const message = getErrorMessage(err, "Не удалось обновить статус смены");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-0.5">
        <Label htmlFor="courier-working" className="text-sm font-medium">
          Статус: работаю
        </Label>
      </div>
      <Switch
        id="courier-working"
        checked={isWorking}
        disabled={isLoading || isSaving || employeeId == null}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
