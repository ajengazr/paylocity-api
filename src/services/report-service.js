import { prismaClient } from "../application/db.js";
import { ResponseError } from "../errors/response.error.js";

// Helper: menghitung tanggal awal dan akhir periode payroll
// Periode: tanggal 28 bulan sebelumnya sampai 27 bulan berjalan
function getPeriodDates(period) {
    const [year, month] = period.split("-").map(Number);
    const startDate = new Date(year, month - 2, 28);
    const endDate = new Date(year, month - 1, 27);
    return { startDate, endDate };
}

// Helper: validasi format periode YYYY-MM
function validatePeriodFormat(period) {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
        throw new ResponseError(400, "Format periode harus YYYY-MM (contoh: 2026-06)");
    }
}

// ============ 1. LAPORAN PAYROLL PER PERIODE ============
// Menampilkan ringkasan dan detail gaji semua karyawan dalam satu periode
async function getPayrollReport(period) {
    validatePeriodFormat(period);

    // Cek apakah payroll untuk periode ini sudah diproses
    const payroll = await prismaClient.payroll.findUnique({
        where: { period },
        include: {
            payslips: {
                include: {
                    employee: {
                        include: {
                            user: { select: { username: true } },
                            department: true,
                            position: true
                        }
                    }
                }
            }
        }
    });

    if (!payroll) {
        throw new ResponseError(404, `Payroll periode ${period} tidak ditemukan`);
    }

    // Hitung ringkasan total
    const summary = {
        totalEmployees: payroll.payslips.length,
        totalBasicSalary: 0,
        totalOvertimePay: 0,
        totalBpjsDeductions: 0,
        totalPph21: 0,
        totalNetSalary: 0
    };

    // Detail per karyawan
    const details = payroll.payslips.map(p => {
        const bpjsTotal = (parseFloat(p.bpjsKesehatan || 0) + parseFloat(p.bpjsKerja || 0));
        
        summary.totalBasicSalary += parseFloat(p.basicSalary || 0);
        summary.totalOvertimePay += parseFloat(p.overtimePay || 0);
        summary.totalBpjsDeductions += bpjsTotal;
        summary.totalPph21 += parseFloat(p.pph21 || 0);
        summary.totalNetSalary += parseFloat(p.netSalary || 0);

        return {
            name: p.employee?.user?.username || '-',
            nik: p.employee?.nik || '-',
            department: p.employee?.department?.name || '-',
            position: p.employee?.position?.name || '-',
            basicSalary: parseFloat(p.basicSalary || 0),
            overtimePay: parseFloat(p.overtimePay || 0),
            bpjsKesehatan: parseFloat(p.bpjsKesehatan || 0),
            bpjsKerja: parseFloat(p.bpjsKerja || 0),
            pph21: parseFloat(p.pph21 || 0),
            totalDeductions: parseFloat(p.totalDeductions || 0),
            netSalary: parseFloat(p.netSalary || 0)
        };
    });

    return { period: payroll.period, summary, details };
}

// ============ 2. LAPORAN LEMBUR PER PERIODE ============
// Menampilkan semua pengajuan lembur dalam rentang periode tertentu
// Bisa difilter berdasarkan status (PENDING, APPROVED, REJECTED, atau ALL)
async function getOvertimeReport(period, status = 'ALL') {
    validatePeriodFormat(period);

    const { startDate, endDate } = getPeriodDates(period);

    // Filter berdasarkan tanggal dan status
    const where = { 
        date: { gte: startDate, lte: endDate } 
    };
    
    if (status && status !== 'ALL') {
        where.status = status;
    }

    const overtimes = await prismaClient.overtime.findMany({
        where,
        include: {
            employee: {
                include: {
                    user: { select: { username: true } },
                    department: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });

    // Hitung ringkasan
    const summary = {
        totalRequests: overtimes.length,
        totalApprovedHours: 0,
        totalApprovedCost: 0,
        countByStatus: { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    };

    // Detail per pengajuan lembur
    const details = overtimes.map(o => {
        const hours = parseFloat(o.totalHours || 0);
        const cost = parseFloat(o.overtimePay || 0);

        summary.countByStatus[o.status] = (summary.countByStatus[o.status] || 0) + 1;
        
        if (o.status === 'APPROVED') {
            summary.totalApprovedHours += hours;
            summary.totalApprovedCost += cost;
        }

        return {
            name: o.employee?.user?.username || '-',
            nik: o.employee?.nik || '-',
            department: o.employee?.department?.name || '-',
            date: o.date,
            startTime: o.startTime,
            endTime: o.endTime,
            totalHours: hours,
            dayType: o.dayType,
            status: o.status,
            overtimePay: cost,
            reason: o.reason
        };
    });

    return { period, summary, details };
}

// ============ 3. LAPORAN KARYAWAN ============
// Menampilkan semua data karyawan dengan filter department dan status
async function getEmployeeReport(departmentId, status) {
    const where = {};
    
    if (departmentId) {
        where.departmentId = Number(departmentId);
    }
    
    if (status) {
        where.status = status;
    }

    const employees = await prismaClient.employee.findMany({
        where,
        include: {
            user: { select: { username: true } },
            department: true,
            position: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Hitung ringkasan
    const summary = {
        totalEmployees: employees.length,
        byDepartment: {},
        byStatus: {}
    };

    // Detail per karyawan
    const details = employees.map(e => {
        const deptName = e.department?.name || 'Unknown';
        
        summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;
        summary.byStatus[e.status] = (summary.byStatus[e.status] || 0) + 1;

        return {
            name: e.user?.username || '-',
            nik: e.nik,
            department: deptName,
            position: e.position?.name || '-',
            basicSalary: parseFloat(e.basicSalary || 0),
            status: e.status,
            joinDate: e.joinDate,
            taxStatus: e.taxStatus
        };
    });

    return { summary, details };
}

// ============ 4. REKAP TAHUNAN ============
// Hanya untuk SUPER_ADMIN
// Menampilkan ringkasan gaji perusahaan selama satu tahun penuh
async function getAnnualReport(year) {
    const yearNum = Number(year);
    
    if (!year || isNaN(yearNum)) {
        throw new ResponseError(400, "Format tahun harus valid (contoh: 2026)");
    }

    // Rentang tanggal satu tahun penuh
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31);

    const payrolls = await prismaClient.payroll.findMany({
        where: {
            startPeriod: { gte: startDate, lte: endDate }
        },
        include: { payslips: true },
        orderBy: { period: 'asc' }
    });

    let totalSalary = 0;
    let totalOvertime = 0;
    const monthlyData = [];

    // Loop dari Januari sampai Desember
    for (let i = 1; i <= 12; i++) {
        const periodStr = `${yearNum}-${String(i).padStart(2, '0')}`;
        const payroll = payrolls.find(p => p.period === periodStr);

        let netTotal = 0;
        let overtimeTotal = 0;

        if (payroll) {
            payroll.payslips.forEach(p => {
                netTotal += parseFloat(p.netSalary || 0);
                overtimeTotal += parseFloat(p.overtimePay || 0);
            });
        }

        totalSalary += netTotal;
        totalOvertime += overtimeTotal;

        monthlyData.push({
            month: i,
            monthName: new Date(yearNum, i - 1).toLocaleDateString('id-ID', { month: 'short' }),
            period: periodStr,
            totalNetSalary: netTotal,
            totalOvertimePay: overtimeTotal
        });
    }

    const processedCount = payrolls.length;
    const avgMonthly = processedCount > 0 ? totalSalary / processedCount : 0;

    return {
        year: yearNum,
        summary: {
            totalPayrollExpense: totalSalary,
            totalOvertimeExpense: totalOvertime,
            averageMonthlyPayroll: avgMonthly,
            processedPeriods: processedCount
        },
        monthlyData
    };
}

export default {
    getPayrollReport,
    getOvertimeReport,
    getEmployeeReport,
    getAnnualReport
};