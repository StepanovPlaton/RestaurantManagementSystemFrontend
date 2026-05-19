"use client";

import useSWR from "swr";

import { employeeService } from "../api/employee.service";
import { employeeKey, employeeMeKey, employeesKey } from "./schemas";

export function useEmployees(params?: {
  role_id?: number;
  is_working?: boolean;
}) {
  const key = employeesKey(params);
  return useSWR(key, () => employeeService.getEmployees(params));
}

export function useEmployee(id: number | null) {
  return useSWR(
    id != null ? employeeKey(id) : null,
    () => employeeService.getEmployee(id!),
  );
}

export function useCurrentEmployee() {
  return useSWR(employeeMeKey, () => employeeService.getMe());
}
