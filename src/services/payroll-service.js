import { prismaClient } from "../application/db.js";
import { createPayrollValidation } from "../validations/payroll-validation.js";
import { validate } from "../validations/validation.js";
import { ResponseError } from "../errors/response.error.js";

const PAYROLL_CONFIG = {
    pph21TER: {
        categoryA: [
            { min: 0, max: 5400000, rate: 0 },
            { min: 5400001, max: 5650000, rate: 0.0025 },
            { min: 5650001, max: 5950000, rate: 0.005 },
            { min: 5950001, max: 6300000, rate: 0.0075 },
            { min: 6300001, max: 6750000, rate: 0.01 },
            { min: 6750001, max: 7500000, rate: 0.0125 },
            { min: 7500001, max: 8550000, rate: 0.015 },
            { min: 8550001, max: 9650000, rate: 0.0175 },
            { min: 9650001, max: 10950000, rate: 0.02 },
            { min: 10950001, max: 12550000, rate: 0.0225 },
            { min: 12550001, max: 14050000, rate: 0.025 },
            { min: 14050001, max: 16050000, rate: 0.03 },
            { min: 16050001, max: 18050000, rate: 0.035 },
            { min: 18050001, max: 20550000, rate: 0.04 },
            { min: 20550001, max: 23550000, rate: 0.05 },
            { min: 23550001, max: 26550000, rate: 0.06 },
            { min: 26550001, max: 30050000, rate: 0.07 },
            { min: 30050001, max: 34050000, rate: 0.08 },
            { min: 34050001, max: 38550000, rate: 0.09 },
            { min: 38550001, max: 43550000, rate: 0.10 },
            { min: 43550001, max: 49550000, rate: 0.11 },
            { min: 49550001, max: 56550000, rate: 0.12 },
            { min: 56550001, max: 65050000, rate: 0.13 },
            { min: 65050001, max: 75050000, rate: 0.14 },
            { min: 75050001, max: 87550000, rate: 0.15 },
            { min: 87550001, max: 102550000, rate: 0.17 },
            { min: 102550001, max: 120050000, rate: 0.19 },
            { min: 120050001, max: 144550000, rate: 0.21 },
            { min: 144550001, max: 179550000, rate: 0.23 },
            { min: 179550001, max: 234550000, rate: 0.24 },
            { min: 234550001, max: 333550000, rate: 0.25 },
            { min: 333550001, max: 444550000, rate: 0.26 },
            { min: 444550001, max: 568550000, rate: 0.27 },
            { min: 568550001, max: 727550000, rate: 0.28 },
            { min: 727550001, max: 928550000, rate: 0.29 },
            { min: 928550001, max: 1184550000, rate: 0.30 },
            { min: 1184550001, max: 1515550000, rate: 0.31 },
            { min: 1515550001, max: 1935550000, rate: 0.32 },
            { min: 1935550001, max: 2475550000, rate: 0.33 },
            { min: 2475550001, max: Infinity, rate: 0.34 }
        ],
        categoryB: [
            { min: 0, max: 6200000, rate: 0 },
            { min: 6200001, max: 6500000, rate: 0.0025 },
            { min: 6500001, max: 6850000, rate: 0.005 },
            { min: 6850001, max: 7300000, rate: 0.0075 },
            { min: 7300001, max: 7800000, rate: 0.01 },
            { min: 7800001, max: 8850000, rate: 0.0125 },
            { min: 8850001, max: 9800000, rate: 0.015 },
            { min: 9800001, max: 10950000, rate: 0.0175 },
            { min: 10950001, max: 12400000, rate: 0.02 },
            { min: 12400001, max: 14050000, rate: 0.0225 },
            { min: 14050001, max: 15700000, rate: 0.025 },
            { min: 15700001, max: 17900000, rate: 0.03 },
            { min: 17900001, max: 20150000, rate: 0.035 },
            { min: 20150001, max: 22950000, rate: 0.04 },
            { min: 22950001, max: 26400000, rate: 0.05 },
            { min: 26400001, max: 29800000, rate: 0.06 },
            { min: 29800001, max: 33800000, rate: 0.07 },
            { min: 33800001, max: 38550000, rate: 0.08 },
            { min: 38550001, max: 43700000, rate: 0.09 },
            { min: 43700001, max: 49600000, rate: 0.10 },
            { min: 49600001, max: 56500000, rate: 0.11 },
            { min: 56500001, max: 64850000, rate: 0.12 },
            { min: 64850001, max: 74900000, rate: 0.13 },
            { min: 74900001, max: 87500000, rate: 0.14 },
            { min: 87500001, max: 102450000, rate: 0.16 },
            { min: 102450001, max: 120000000, rate: 0.18 },
            { min: 12000001, max: 144400000, rate: 0.20 },
            { min: 144400001, max: 179350000, rate: 0.22 },
            { min: 179350001, max: 234200000, rate: 0.23 },
            { min: 234200001, max: 333200000, rate: 0.24 },
            { min: 333200001, max: 444000000, rate: 0.25 },
            { min: 444000001, max: 567850000, rate: 0.26 },
            { min: 567850001, max: 726650000, rate: 0.27 },
            { min: 726650001, max: 927450000, rate: 0.28 },
            { min: 927450001, max: 1183150000, rate: 0.29 },
            { min: 1183150001, max: 1513800000, rate: 0.30 },
            { min: 1513800000, max: 1933300000, rate: 0.31 },
            { min: 1933300001, max: 2472700000, rate: 0.32 },
            { min: 2472700001, max: Infinity, rate: 0.33 }
        ],
        categoryC: [
            { min: 0, max: 6600000, rate: 0 },
            { min: 6600001, max: 6950000, rate: 0.0025 },
            { min: 6950001, max: 7350000, rate: 0.005 },
            { min: 7350001, max: 7800000, rate: 0.0075 },
            { min: 7800001, max: 8300000, rate: 0.01 },
            { min: 8300001, max: 9350000, rate: 0.0125 },
            { min: 9350001, max: 10350000, rate: 0.015 },
            { min: 10350001, max: 11350000, rate: 0.0175 },
            { min: 11350001, max: 12800000, rate: 0.02 },
            { min: 12800001, max: 14450000, rate: 0.0225 },
            { min: 14450001, max: 16100000, rate: 0.025 },
            { min: 16100001, max: 18350000, rate: 0.03 },
            { min: 18350001, max: 20550000, rate: 0.035 },
            { min: 20550001, max: 23350000, rate: 0.04 },
            { min: 23350001, max: 26800000, rate: 0.05 },
            { min: 26800001, max: 30200000, rate: 0.06 },
            { min: 30200001, max: 34200000, rate: 0.07 },
            { min: 34200001, max: 39000000, rate: 0.08 },
            { min: 39000001, max: 44150000, rate: 0.09 },
            { min: 44150001, max: 50050000, rate: 0.10 },
            { min: 50050001, max: 57050000, rate: 0.11 },
            { min: 57050001, max: 65450000, rate: 0.12 },
            { min: 65450001, max: 75550000, rate: 0.13 },
            { min: 75550001, max: 88250000, rate: 0.14 },
            { min: 88250001, max: 103150000, rate: 0.15 },
            { min: 103150001, max: 120850000, rate: 0.17 },
            { min: 120850001, max: 145450000, rate: 0.19 },
            { min: 145450001, max: 180650000, rate: 0.21 },
            { min: 180650001, max: 235850000, rate: 0.22 },
            { min: 235850001, max: 335550000, rate: 0.23 },
            { min: 335550001, max: 447150000, rate: 0.24 },
            { min: 447150001, max: 571850000, rate: 0.25 },
            { min: 571850001, max: 731750000, rate: 0.26 },
            { min: 731750001, max: 933950000, rate: 0.27 },
            { min: 933950001, max: 1191350000, rate: 0.28 },
            { min: 1191350001, max: 1524300000, rate: 0.29 },
            { min: 1524300000, max: 1946650000, rate: 0.30 },
            { min: 1946650000, max: 2489800000, rate: 0.31 },
            { min: 2489800000, max: Infinity, rate: 0.32 }
        ]
    },
    bpjsEmployee: { jht: 0.02, kesehatan: 0.01, ketenagakerjaan: 0.02 },
    bpjsCompany: { jht: 0.037, kesehatan: 0.04, ketenagakerjaan: 0.0115 }
};

function getPeriodDates(period) {
    const [year, month] = period.split("-").map(Number);
    const startDate = new Date(year, month - 2, 28, 0, 0, 0);
    const endDate = new Date(year, month - 1, 27, 23, 59, 59);
    return { startDate, endDate };
}

function getPtkpCategory(taxStatus) {
    const normalized = (taxStatus || "TK/0").toLowerCase().replace(/[^a-z0-9]/g, "");
    const categoryACodes = ["tk0", "tk1", "k0"];
    const categoryBCodes = ["tk2", "tk3", "k1", "k2"];
    const categoryCCodes = ["k3"];
    
    if (categoryACodes.includes(normalized)) return "A";
    if (categoryBCodes.includes(normalized)) return "B";
    if (categoryCCodes.includes(normalized)) return "C";
    return "A";
}

function calculatePph21(basicSalary, overtimePay, taxStatus = "tk0") {
    const bruttoSalary = parseFloat(basicSalary) + parseFloat(overtimePay || 0);
    const category = getPtkpCategory(taxStatus);
    
    let categoryRates;
    switch (category) {
        case "A": categoryRates = PAYROLL_CONFIG.pph21TER.categoryA; break;
        case "B": categoryRates = PAYROLL_CONFIG.pph21TER.categoryB; break;
        case "C": categoryRates = PAYROLL_CONFIG.pph21TER.categoryC; break;
        default: categoryRates = PAYROLL_CONFIG.pph21TER.categoryA;
    }
    
    for (const tier of categoryRates) {
        if (bruttoSalary >= tier.min && bruttoSalary < tier.max) {
            return parseFloat((bruttoSalary * tier.rate).toFixed(2));
        }
    }
    
    return parseFloat((bruttoSalary * 0.09).toFixed(2));
}

function calculateBpjsDeductions(basicSalary) {
    const basic = parseFloat(basicSalary);
    const bpjsHealthSalary = Math.min(basic, 12000000);
    
    return {
        bpjsKesehatan: parseFloat((bpjsHealthSalary * PAYROLL_CONFIG.bpjsEmployee.kesehatan).toFixed(2)),
        bpjsKerja: parseFloat((basic * PAYROLL_CONFIG.bpjsEmployee.ketenagakerjaan).toFixed(2)),
        jht: parseFloat((basic * PAYROLL_CONFIG.bpjsEmployee.jht).toFixed(2))
    };
}

function calculateCompanyBpjs(basicSalary) {
    const basic = parseFloat(basicSalary);
    
    return {
        bpjsKesehatan: parseFloat((basic * PAYROLL_CONFIG.bpjsCompany.kesehatan).toFixed(2)),
        bpjsKerja: parseFloat((basic * PAYROLL_CONFIG.bpjsCompany.ketenagakerjaan).toFixed(2)),
        jht: parseFloat((basic * PAYROLL_CONFIG.bpjsCompany.jht).toFixed(2))
    };
}

function calculatePayslip(basicSalary, overtimePay = 0, taxStatus = "tk0") {
    const basic = parseFloat(basicSalary);
    const overtime = parseFloat(overtimePay || 0);
    
    const totalEarnings = parseFloat((basic + overtime).toFixed(2));
    
    const bpjsEmployee = calculateBpjsDeductions(basic);
    const pph21 = calculatePph21(basic, overtime, taxStatus);
    const totalDeductions = parseFloat((
        bpjsEmployee.bpjsKesehatan + 
        bpjsEmployee.bpjsKerja + 
        bpjsEmployee.jht + 
        pph21
    ).toFixed(2));
    
    const bpjsCompany = calculateCompanyBpjs(basic);
    const totalCompanyContribution = parseFloat((
        bpjsCompany.bpjsKesehatan + 
        bpjsCompany.bpjsKerja + 
        bpjsCompany.jht
    ).toFixed(2));
    
    const netSalary = parseFloat((totalEarnings - totalDeductions).toFixed(2));
    
    return {
        basicSalary: basic,
        overtimePay: overtime,
        bpjsKesehatan: bpjsEmployee.bpjsKesehatan,
        bpjsKerja: bpjsEmployee.bpjsKerja,
        jht: bpjsEmployee.jht,
        pph21,
        totalEarnings,
        totalDeductions,
        netSalary,
        companyBpjsKesehatan: bpjsCompany.bpjsKesehatan,
        companyBpjsKerja: bpjsCompany.bpjsKerja,
        companyJht: bpjsCompany.jht,
        totalCompanyContribution
    };
}

// MEMPROSES PAYROLL
async function create(userId, reqBody) {
    reqBody = validate(createPayrollValidation, reqBody);
    const { period } = reqBody;
    
    const [year, month] = period.split("-").map(Number);
    const periodDate = new Date(year, month - 1, 27);
    const today = new Date();
    
    if (periodDate > today) {
        throw new ResponseError(400, `Periode ${period} belum boleh diproses.`);
    }
    
    const existingPayroll = await prismaClient.payroll.findUnique({ where: { period } });
    if (existingPayroll) {
        throw new ResponseError(400, `Payroll untuk periode ${period} sudah pernah diproses.`);
    }
    
    const { startDate, endDate } = getPeriodDates(period);
    
    // Di model User, field id adalah primary key, bukan userId
    const employees = await prismaClient.employee.findMany({
        where: { status: "ACTIVE" },
        select: {
            id: true,
            nik: true,
            basicSalary: true,
            taxStatus: true,
            user: {
                select: {
                    id: true,    
                    username: true,
                    email: true
                }
            },
            department: {
                select: { name: true }
            },
            position: {
                select: { name: true }
            },
            overtimes: {
                where: { 
                    date: { gte: startDate, lte: endDate }, 
                    status: "APPROVED", 
                    payrollId: null 
                },
                select: { id: true, overtimePay: true }
            }
        }
    });
    
    if (employees.length === 0) {
        throw new ResponseError(404, "Tidak ada employee ACTIVE untuk diproses.");
    }
    
    return prismaClient.$transaction(async (tx) => {
        const payroll = await tx.payroll.create({
            data: { 
                period, 
                startPeriod: startDate, 
                endPeriod: endDate, 
                status: "PROCESSED", 
                processedBy: userId, 
                processedAt: new Date() 
            }
        });
        
        const payslips = [];
        
        for (const employee of employees) {
            let totalOvertimePay = 0;
            for (const overtime of employee.overtimes) {
                totalOvertimePay += parseFloat(overtime.overtimePay || 0);
                await tx.overtime.update({ 
                    where: { id: overtime.id }, 
                    data: { payrollId: payroll.id } 
                });
            }
            
            const taxStatus = employee.taxStatus || "tk0";
            const payslipData = calculatePayslip(employee.basicSalary, totalOvertimePay, taxStatus);
            
            const payslip = await tx.payslip.create({
                data: {
                    payrollId: payroll.id,
                    employeeId: employee.id,
                    basicSalary: payslipData.basicSalary,
                    overtimePay: payslipData.overtimePay,
                    bpjsKesehatan: payslipData.bpjsKesehatan,
                    bpjsKerja: payslipData.bpjsKerja,
                    jht: payslipData.jht,
                    pph21: payslipData.pph21,
                    companyBpjsKesehatan: payslipData.companyBpjsKesehatan,
                    companyBpjsKerja: payslipData.companyBpjsKerja,
                    companyJht: payslipData.companyJht,
                    totalCompanyContribution: payslipData.totalCompanyContribution,
                    totalEarnings: payslipData.totalEarnings,
                    totalDeductions: payslipData.totalDeductions,
                    netSalary: payslipData.netSalary
                },
                include: {
                    employee: {
                        select: { 
                            id: true, 
                            userId: true,  
                            nik: true, 
                            taxStatus: true, 
                            user: { 
                                select: { 
                                    id: true,
                                    username: true, 
                                    email: true 
                                } 
                            }, 
                            department: { select: { name: true } }, 
                            position: { select: { name: true } } 
                        }
                    }
                }
            });
            
            payslips.push(payslip);
        }
        
        for (const payslip of payslips) {
            await tx.notification.create({
                data: { 
                    userId: payslip.employee.userId,
                    title: 'Slip Gaji Tersedia', 
                    message: `Slip gaji periode ${payroll.period} telah tersedia. Gaji bersih: Rp ${parseFloat(payslip.netSalary).toLocaleString('id-ID')}.`, 
                    type: 'payroll' 
                }
            });
        }
        
        // Kirim notifikasi ke admin
        await tx.notification.create({
            data: { 
                userId: userId, 
                title: 'Payroll Berhasil Diproses', 
                message: `Payroll periode ${payroll.period} untuk ${payslips.length} karyawan telah berhasil diproses.`, 
                type: 'success' 
            }
        });
        
        return { 
            payroll: { 
                id: payroll.id, 
                period: payroll.period, 
                startPeriod: payroll.startPeriod, 
                endPeriod: payroll.endPeriod, 
                status: payroll.status, 
                processedBy: payroll.processedBy, 
                processedAt: payroll.processedAt 
            }, 
            payslipsCount: payslips.length, 
            payslips 
        };
    });
}

// MENDAPATKAN SEMUA PAYROLL
async function getAll() {
    return prismaClient.payroll.findMany({
        include: {
            payslips: {
                include: {
                    employee: {
                        select: { 
                            nik: true, 
                            taxStatus: true, 
                            user: { 
                                select: { 
                                    id: true,
                                    username: true, 
                                    email: true 
                                } 
                            }, 
                            department: { select: { name: true } }, 
                            position: { select: { name: true } } 
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}

// MENDAPATKAN PAYROLL BERDASARKAN PERIODE
async function getByPeriod(period) {
    const payroll = await prismaClient.payroll.findUnique({
        where: { period },
        include: {
            payslips: {
                include: {
                    employee: {
                        select: { 
                            id: true, 
                            nik: true, 
                            basicSalary: true, 
                            taxStatus: true, 
                            user: { 
                                select: { 
                                    id: true,
                                    username: true, 
                                    email: true 
                                } 
                            }, 
                            department: { select: { name: true } }, 
                            position: { select: { name: true } } 
                        }
                    },
                    payroll: { select: { period: true } }
                }
            }
        }
    });
    
    if (!payroll) {
        throw new ResponseError(404, `Payroll untuk periode ${period} tidak ditemukan.`);
    }
    
    return payroll;
}

// MENDAPATKAN PAYSLIP BERDASARKAN EMPLOYEE ID
async function getPayslipByEmployee(employeeId, period) {
    const whereClause = { employeeId };
    
    if (period) {
        const payroll = await prismaClient.payroll.findUnique({ 
            where: { period }, 
            select: { id: true } 
        });
        
        if (!payroll) {
            throw new ResponseError(404, `Payroll untuk periode ${period} tidak ditemukan.`);
        }
        
        whereClause.payrollId = payroll.id;
    }
    
    const payslips = await prismaClient.payslip.findMany({
        where: whereClause,
        include: {
            payroll: { select: { id: true, period: true, startPeriod: true, endPeriod: true, processedAt: true } },
            employee: { 
                select: { 
                    nik: true, 
                    taxStatus: true, 
                    user: { 
                        select: { 
                            id: true,
                            username: true, 
                            email: true 
                        } 
                    }, 
                    department: { select: { name: true } }, 
                    position: { select: { name: true } } 
                } 
            }
        },
        orderBy: { payroll: { period: "desc" } }
    });
    
    if (payslips.length === 0) {
        throw new ResponseError(404, `Payslip tidak ditemukan.`);
    }
    
    return payslips;
}

// UPDATE STATUS PAYROLL
async function updateStatus(period, status, userId) {
    const validStatuses = ["PROCESSED", "CANCELLED"];
    
    if (!validStatuses.includes(status)) {
        throw new ResponseError(400, `Status tidak valid.`);
    }
    
    const payroll = await prismaClient.payroll.findUnique({ where: { period } });
    
    if (!payroll) {
        throw new ResponseError(404, `Payroll untuk periode ${period} tidak ditemukan.`);
    }
    
    return prismaClient.payroll.update({
        where: { period },
        data: { 
            status: status === "PROCESSED" ? "PROCESSED" : "CANCELLED", 
            processedBy: userId, 
            processedAt: new Date() 
        },
        include: { payslips: true }
    });
}

// HAPUS PAYROLL
async function deletePayroll(period) {
    const payroll = await prismaClient.payroll.findUnique({ 
        where: { period }, 
        include: { payslips: true } 
    });
    
    if (!payroll) {
        throw new ResponseError(404, `Payroll untuk periode ${period} tidak ditemukan.`);
    }
    
    return prismaClient.$transaction(async (tx) => {
        await tx.overtime.updateMany({ 
            where: { payrollId: payroll.id }, 
            data: { payrollId: null } 
        });
        
        await tx.payslip.deleteMany({ 
            where: { payrollId: payroll.id } 
        });
        
        await tx.payroll.delete({ 
            where: { id: payroll.id } 
        });
        
        return { message: `Payroll periode ${period} berhasil dihapus.` };
    });
}

export default { 
    create, 
    getAll, 
    getByPeriod, 
    getPayslipByEmployee, 
    updateStatus, 
    deletePayroll 
};