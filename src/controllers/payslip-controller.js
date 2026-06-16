import payslipService from "../services/payslip-service.js";
import { ResponseError } from "../errors/response.error.js";

async function getPayslipsByPeriod(req, res, next) {
    try {
        const result = await payslipService.getPayslipsByPeriod(req.params.period);
        return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
}

async function getPayslipDetail(req, res, next) {
    try {
        const result = await payslipService.getPayslipDetail(req.params.period, req.params.employeeId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
}

async function getMyPayslips(req, res, next) {
    try {
        const result = await payslipService.getMyPayslips(req.user.id, req.query);
        return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) { next(error); }
}

async function getMyPayslipDetail(req, res, next) {
    try {
        const result = await payslipService.getMyPayslipDetail(req.user.id, req.params.id);
        return res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
}

export default {
    getPayslipsByPeriod,
    getPayslipDetail,
    getMyPayslips,
    getMyPayslipDetail
};