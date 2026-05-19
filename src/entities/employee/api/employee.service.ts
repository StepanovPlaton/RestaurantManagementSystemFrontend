import { z } from "zod";

import { httpService } from "@/shared/api";

import {
  employeeSchema,
  employeesListSchema,
  type Employee,
  type EmployeeCreate,
  type EmployeeUpdate,
} from "../model/schemas";

const avatarResponseSchema = z.object({
  id: z.number(),
  path: z.string(),
});

type EmployeeQuery = {
  role_id?: number;
  is_working?: boolean;
};

export class EmployeeService {
  private buildPath(query?: EmployeeQuery): string {
    if (!query?.role_id && query?.is_working === undefined) {
      return "/employees";
    }
    const search = new URLSearchParams();
    if (query.role_id != null) search.set("role_id", String(query.role_id));
    if (query.is_working !== undefined) {
      search.set("is_working", String(query.is_working));
    }
    return `/employees?${search.toString()}`;
  }

  getEmployees(query?: EmployeeQuery) {
    return httpService.get(this.buildPath(query), employeesListSchema, {
      authKind: "employee",
    });
  }

  getEmployee(id: number): Promise<Employee> {
    return httpService.get(`/employees/${id}`, employeeSchema, {
      authKind: "employee",
    });
  }

  getMe(): Promise<Employee> {
    return httpService.get("/employees/me", employeeSchema, {
      authKind: "employee",
    });
  }

  patchMe(body: EmployeeUpdate): Promise<Employee> {
    return httpService.patch("/employees/me", body, employeeSchema, {
      authKind: "employee",
    });
  }

  createEmployee(body: EmployeeCreate): Promise<Employee> {
    return httpService.post("/employees", body, employeeSchema, {
      authKind: "employee",
    });
  }

  updateEmployee(id: number, body: EmployeeUpdate): Promise<Employee> {
    return httpService.patch(`/employees/${id}`, body, employeeSchema, {
      authKind: "employee",
    });
  }

  deleteEmployee(id: number): Promise<void> {
    return httpService.delete(`/employees/${id}`, undefined, {
      authKind: "employee",
    });
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return httpService.upload("/avatars", formData, avatarResponseSchema, {
      authKind: "employee",
    });
  }
}

export const employeeService = new EmployeeService();
