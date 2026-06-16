import reportService from "../services/report-service.js";

async function getPayrollReport(req, res, next) {
  try {
    const result = await reportService.getPayrollReport(req.query.period);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getOvertimeReport(req, res, next) {
  try {
    const result = await reportService.getOvertimeReport(req.query.period, req.query.status);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getEmployeeReport(req, res, next) {
  try {
    const result = await reportService.getEmployeeReport(req.query.department, req.query.status);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function getAnnualReport(req, res, next) {
  try {
    const result = await reportService.getAnnualReport(req.query.year);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export default {
  getPayrollReport,
  getOvertimeReport,
  getEmployeeReport,
  getAnnualReport
};