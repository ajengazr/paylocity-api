import payrollService from "../services/payroll-service.js";

// ============ PROSES PAYROLL (SUPER_ADMIN / HR_ADMIN) ============
async function createPayroll(req, res, next) {
    try {
        const result = await payrollService.create(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// ============ GET ALL PAYROLL ============
async function getAllPayrolls(req, res, next) {
    try {
        const result = await payrollService.getAll();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// ============ GET PAYROLL BY PERIOD ============
async function getPayrollByPeriod(req, res, next) {
    try {
        const { period } = req.params;
        const result = await payrollService.getByPeriod(period);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createPayroll,
    getAllPayrolls,
    getPayrollByPeriod
};