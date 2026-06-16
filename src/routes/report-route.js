import express from "express";
import reportController from "../controllers/report-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const reportApi = express.Router();

reportApi.get("/api/reports/payroll",
  authMiddleware,
  authorize("SUPER_ADMIN", "HR_ADMIN"),
  reportController.getPayrollReport
);

reportApi.get("/api/reports/overtime",
  authMiddleware,
  authorize("SUPER_ADMIN", "HR_ADMIN"),
  reportController.getOvertimeReport
);

reportApi.get("/api/reports/employees",
  authMiddleware,
  authorize("SUPER_ADMIN", "HR_ADMIN"),
  reportController.getEmployeeReport
);

reportApi.get("/api/reports/annual",
  authMiddleware,
  authorize("SUPER_ADMIN"),
  reportController.getAnnualReport
);

export default reportApi;