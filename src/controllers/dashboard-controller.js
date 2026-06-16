import dashboardService from "../services/dashboard-service.js";

const getAdminDashboard = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getAdminStats = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: { stats: result.stats } });
    } catch (error) {
        next(error);
    }
};

const getAdminChart = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: { chartData: result.chartData } });
    } catch (error) {
        next(error);
    }
};

const getAdminOvertime = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: { tableData: result.tableData } });
    } catch (error) {
        next(error);
    }
};

const getAdminActivity = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: { activityData: result.activityData } });
    } catch (error) {
        next(error);
    }
};

const getAdminPayrollSummary = async (req, res, next) => {
    try {
        const result = await dashboardService.getStats();
        res.status(200).json({ success: true, data: { payrollSummary: result.payrollSummary } });
    } catch (error) {
        next(error);
    }
};

const getPayrollPeriods = async (req, res, next) => {
    try {
        const result = await dashboardService.getPayrollPeriods();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getPayrollByPeriod = async (req, res, next) => {
    try {
        const { period } = req.params;
        const result = await dashboardService.getPayrollByPeriod(period);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getAllPayrolls = async (req, res, next) => {
    try {
        const result = await dashboardService.getAllPayrollsAggregate();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export default {
    getAdminDashboard,
    getAdminStats,
    getAdminChart,
    getAdminOvertime,
    getAdminActivity,
    getAdminPayrollSummary,
    getPayrollPeriods,
    getPayrollByPeriod,
    getAllPayrolls  // ← tambah
};