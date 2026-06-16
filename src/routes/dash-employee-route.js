import express from "express";
import DashboardEmployeeController from "../controllers/dashboard-employee-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const dashEmployeeApi = express.Router();

dashEmployeeApi.get("/dashboard/employee/stats",
    authMiddleware,
    DashboardEmployeeController.getStats);

dashEmployeeApi.get("/dashboard/employee/chart",
    authMiddleware,
    DashboardEmployeeController.getChartData);

dashEmployeeApi.get("/dashboard/employee/overtime-history",
    authMiddleware,
    DashboardEmployeeController.getOvertimeHistory);

dashEmployeeApi.get("/dashboard/employee/activity-log",
    authMiddleware,
    DashboardEmployeeController.getActivityLog);

dashEmployeeApi.get("/dashboard/employee/payroll-summary",
    authMiddleware,
    DashboardEmployeeController.getPayrollSummary);

dashEmployeeApi.get("/dashboard/employee/payroll-periods",
    authMiddleware,
    authorize("EMPLOYEE"),
    DashboardEmployeeController.getPayrollPeriods);

dashEmployeeApi.get("/dashboard/employee",
    authMiddleware,
    DashboardEmployeeController.getDashboard);