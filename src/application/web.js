import express from "express";
import cors from "cors";
import cookie from "cookie-parser";
import { authApi } from "../routes/auth-router.js";
import { errorMiddleware } from "../middleware/error.middleware.js";
import { protectedApi } from "../routes/protected.api.js";
import { employeeApi } from "../routes/employee-route.js";
import { departmentApi } from "../routes/departement-route.js";
import { positionApi } from "../routes/position-route.js";
import { overtimeApi } from "../routes/overtime-route.js";
import payrollApi from "../routes/payroll-route.js";
import dashboardApi from "../routes/dashboard-route.js";
import { payslipApi } from "../routes/payslip-route.js";
import { dashEmployeeApi } from "../routes/dash-employee-route.js";
import notificationApi from "../routes/notification-route.js";
import { reportApi } from "../routes/report-route.js";
import { leaveApi } from "../routes/leave-route.js";
const web = express();

web.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
web.use(cookie());

web.use(express.json());
web.use(authApi);
web.use(protectedApi);
web.use(employeeApi);
web.use(departmentApi);
web.use(positionApi);
web.use(overtimeApi);
web.use(payrollApi);
web.use(payslipApi);
web.use(dashboardApi);
web.use(dashEmployeeApi);
web.use(reportApi);
web.use(notificationApi);
web.use(leaveApi);
web.use(errorMiddleware);

export { web };