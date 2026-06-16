import { prismaClient } from "../application/db.js";
import { ResponseError } from "../errors/response.error.js";

// Select fields yang akan diambil untuk response payslip
// Digunakan di semua fungsi agar konsisten
const payslipSelect = {
    id: true,
    basicSalary: true,
    overtimePay: true,
    totalEarnings: true,
    bpjsKesehatan: true,
    bpjsKerja: true,
    jht: true,
    pph21: true,
    totalDeductions: true,
    netSalary: true,
    companyBpjsKesehatan: true,
    companyBpjsKerja: true,
    companyJht: true,
    totalCompanyContribution: true,
    createdAt: true,
    payroll: {
        select: {
            id: true,
            period: true,
            startPeriod: true,
            endPeriod: true,
            status: true
        }
    },
    employee: {
        select: {
            id: true,
            nik: true,
            basicSalary: true,
            taxStatus: true,
            user: {
                select: {
                    username: true,
                    email: true
                }
            },
            department: {
                select: {
                    name: true
                }
            },
            position: {
                select: {
                    name: true
                }
            }
        }
    }
};

// Validasi ID agar tidak sembarangan input
function validateId(value, fieldName = "ID") {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
        throw new ResponseError(400, `${fieldName} tidak valid.`);
    }
    return num;
}

// Validasi page dan limit untuk pagination
function validatePagination(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    if (pageNum < 1) {
        throw new ResponseError(400, "Page minimal 1.");
    }
    if (limitNum < 1) {
        throw new ResponseError(400, "Limit minimal 1.");
    }
    if (limitNum > 100) {
        throw new ResponseError(400, "Limit maksimal 100.");
    }
    
    return { page: pageNum, limit: limitNum };
}

// ADMIN: Mendapatkan semua payslip dalam satu periode payroll
async function getPayslipsByPeriod(period) {
    // Cek apakah payroll untuk periode ini ada
    const payroll = await prismaClient.payroll.findUnique({ 
        where: { period } 
    });
    
    if (!payroll) {
        throw new ResponseError(404, `Payroll periode ${period} tidak ditemukan.`);
    }
    
    // Ambil semua payslip dalam periode tersebut
    return prismaClient.payslip.findMany({
        where: { payrollId: payroll.id },
        select: payslipSelect,
        orderBy: { employee: { nik: "asc" } }
    });
}

// ADMIN: Mendapatkan detail payslip karyawan tertentu dalam satu periode
async function getPayslipDetail(period, employeeId) {
    // Cek payroll
    const payroll = await prismaClient.payroll.findUnique({ 
        where: { period } 
    });
    
    if (!payroll) {
        throw new ResponseError(404, `Payroll periode ${period} tidak ditemukan.`);
    }
    
    const empId = validateId(employeeId, "Employee ID");
    
    // Cari payslip berdasarkan kombinasi payrollId dan employeeId
    const payslip = await prismaClient.payslip.findUnique({
        where: { 
            payrollId_employeeId: { 
                payrollId: payroll.id, 
                employeeId: empId 
            } 
        },
        select: payslipSelect
    });
    
    if (!payslip) {
        throw new ResponseError(404, "Payslip tidak ditemukan.");
    }
    
    return payslip;
}

// KARYAWAN: Mendapatkan riwayat payslip milik sendiri (dengan pagination)
async function getMyPayslips(userId, query = {}) {
    const { period, page = 1, limit = 10 } = query;
    
    // Validasi pagination
    const { page: pageNum, limit: take } = validatePagination(page, limit);
    
    // Cek data employee
    const employee = await prismaClient.employee.findUnique({ 
        where: { userId },
        select: { id: true }
    });
    
    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }
    
    // Siapkan filter
    const where = { employeeId: employee.id };
    
    // Jika ada filter period, validasi dulu periodnya
    if (period) {
        const payroll = await prismaClient.payroll.findUnique({ 
            where: { period },
            select: { id: true }
        });
        
        if (!payroll) {
            throw new ResponseError(404, `Periode ${period} tidak ditemukan.`);
        }
        
        where.payrollId = payroll.id;
    }
    
    const skip = (pageNum - 1) * take;
    
    // Hitung total dan ambil data dalam 1 transaction
    const [total, payslips] = await prismaClient.$transaction([
        prismaClient.payslip.count({ where }),
        prismaClient.payslip.findMany({
            where,
            select: payslipSelect,
            orderBy: { payroll: { period: "desc" } },
            skip,
            take
        })
    ]);
    
    return {
        data: payslips,
        pagination: {
            total,
            page: pageNum,
            limit: take,
            totalPages: Math.ceil(total / take)
        }
    };
}

// KARYAWAN: Mendapatkan detail satu payslip milik sendiri berdasarkan ID payslip
async function getMyPayslipDetail(userId, payslipId) {
    // Cek data employee
    const employee = await prismaClient.employee.findUnique({ 
        where: { userId },
        select: { id: true }
    });
    
    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }
    
    const id = validateId(payslipId, "Payslip ID");
    
    // Cari payslip yang dimiliki oleh employee ini
    const payslip = await prismaClient.payslip.findFirst({
        where: { 
            id: id, 
            employeeId: employee.id 
        },
        select: payslipSelect
    });
    
    if (!payslip) {
        throw new ResponseError(404, "Payslip tidak ditemukan.");
    }
    
    return payslip;
}

export default { 
    getPayslipsByPeriod, 
    getPayslipDetail, 
    getMyPayslips, 
    getMyPayslipDetail 
};