import express from "express";
import employeeController from "../controllers/employee-controller.js";
import { authorize } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const employeeApi = express.Router();

employeeApi.get("/api/employees/me", 
    authMiddleware, 
    employeeController.getMyProfile);

employeeApi.put("/api/employees/me", 
    authMiddleware, 
    employeeController.updateMyProfile);

employeeApi.post("/api/employees/create",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    employeeController.createEmployee);

employeeApi.get("/api/employees", 
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    employeeController.getAllEmployees);

employeeApi.get("/api/employees/:id", 
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    employeeController.getEmployeeById);

employeeApi.put("/api/employees/:id", 
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    employeeController.updateEmployee);

employeeApi.delete("/api/employees/:id", 
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    employeeController.deleteEmployee);