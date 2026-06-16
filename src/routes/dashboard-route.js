import express from "express";
import dashboardController from "../controllers/dashboard-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const dashboardApi = express.Router();

// Admin only
dashboardApi.get("/dashboard/admin",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminDashboard
);

dashboardApi.get("/dashboard/admin/stats",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminStats
);

dashboardApi.get("/dashboard/admin/chart",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminChart
);

dashboardApi.get("/dashboard/admin/overtime-history",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminOvertime
);

dashboardApi.get("/dashboard/admin/activity-log",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminActivity
);

dashboardApi.get("/dashboard/admin/payroll-summary",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAdminPayrollSummary
);

dashboardApi.get("/payroll/all",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getAllPayrolls);

dashboardApi.get("/payroll/periods",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getPayrollPeriods);

dashboardApi.get("/payroll/:period",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    dashboardController.getPayrollByPeriod);


export default dashboardApi;