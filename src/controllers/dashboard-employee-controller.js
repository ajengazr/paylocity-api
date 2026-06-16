import DashboardEmployeeService from "../services/dashboard-employee-service.js";

class DashboardEmployeeController {
    static async getDashboard(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getDashboard(req.user.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    static async getStats(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getDashboard(req.user.id);
            res.status(200).json({ success: true, data: result.stats });
        } catch (error) { next(error); }
    }

    static async getChartData(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getDashboard(req.user.id);
            res.status(200).json({ success: true, data: result.chartData });
        } catch (error) { next(error); }
    }

    static async getOvertimeHistory(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getDashboard(req.user.id);
            res.status(200).json({ success: true, data: result.overtimeHistory });
        } catch (error) { next(error); }
    }

    static async getActivityLog(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getDashboard(req.user.id);
            res.status(200).json({ success: true, data: result.activityLog });
        } catch (error) { next(error); }
    }

    static async getPayrollSummary(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getPayrollSummary(req.user.id, req.query.period);
            res.status(200).json({ success: true, data: result });
        } catch (error) { next(error); }
    }

    static async getPayrollPeriods(req, res, next) {
        try {
            const result = await DashboardEmployeeService.getPayrollPeriods(req.user.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export default DashboardEmployeeController;