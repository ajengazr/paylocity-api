import express from "express";
import payslipController from "../controllers/payslip-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const payslipApi = express.Router();

// ============ ADMIN ROUTES ============

// Lihat semua payslip dalam 1 periode
// GET /api/payslips/2025-06
payslipApi.get("/api/payslips/:period",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    payslipController.getPayslipsByPeriod
);

// Lihat detail payslip 1 karyawan dalam 1 periode
// GET /api/payslips/2025-06/employee/3
payslipApi.get("/api/payslips/:period/employee/:employeeId",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    payslipController.getPayslipDetail
);

// ============ EMPLOYEE ROUTES ============

// Employee lihat semua slip gaji miliknya
// GET /api/my-payslips
payslipApi.get("/api/my-payslips",
    authMiddleware,
    authorize("EMPLOYEE"),
    payslipController.getMyPayslips
);

// Employee lihat detail 1 slip gaji
// GET /api/my-payslips/5
payslipApi.get("/api/my-payslips/:id",
    authMiddleware,
    authorize("EMPLOYEE"),
    payslipController.getMyPayslipDetail
);