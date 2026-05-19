export { employeeService, EmployeeService } from "./api/employee.service";
export {
  employeesKey,
  employeeKey,
  employeeMeKey,
  employeeCreateSchema,
  employeeUpdateSchema,
  type Employee,
  type EmployeeCreate,
  type EmployeeUpdate,
} from "./model/schemas";
export {
  useCurrentEmployee,
  useEmployee,
  useEmployees,
} from "./model/use-employees";
export { useCourierEmployee } from "./model/use-courier-employee";
