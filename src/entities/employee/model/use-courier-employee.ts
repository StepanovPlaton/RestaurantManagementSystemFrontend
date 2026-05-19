"use client";

import useSWR from "swr";

import { employeeService } from "../api/employee.service";
import { employeeMeKey } from "./schemas";

export function useCourierEmployee() {
  const { data: employee, error, isLoading, mutate } = useSWR(
    employeeMeKey,
    () => employeeService.getMe(),
  );

  return {
    employee,
    employeeId: employee?.id ?? null,
    login: employee?.login ?? null,
    error,
    isLoading,
    mutate,
    isProfileApiAvailable: employee != null && error == null,
    isApiBlocked: error != null && !isLoading && employee == null,
  };
}
