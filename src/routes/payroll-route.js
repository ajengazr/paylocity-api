import express from "express";
import payrollController from "../controllers/payroll-controller.js";
import { authorize } from "../middleware/role.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const payrollApi = express.Router();

// ============ ADMIN ROUTES (SUPER_ADMIN, HR_ADMIN) ============

// Proses payroll semua karyawan ACTIVE dalam 1 periode
payrollApi.post("/api/payrolls",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    payrollController.createPayroll);

// Get semua payroll
payrollApi.get("/api/payrolls",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    payrollController.getAllPayrolls);

// Get payroll detail by period
payrollApi.get("/api/payrolls/:period",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    payrollController.getPayrollByPeriod);

export default payrollApi;