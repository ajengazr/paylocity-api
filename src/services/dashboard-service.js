import { prismaClient } from "../application/db.js";

async function getStats() {
    const totalKaryawan = await prismaClient.employee.count({ where: { status: "ACTIVE" } }) || 0;
    const totalDepartemen = await prismaClient.department.count() || 0;

    const overtimeAgg = await prismaClient.overtime.aggregate({
        _sum: { totalHours: true },
        where: { status: "APPROVED" }
    });
    const totalOvertimeHours = overtimeAgg._sum.totalHours || 0;

    const totalPendingOvertime = await prismaClient.overtime.count({ where: { status: "PENDING" } }) || 0;

    const latestPayroll = await prismaClient.payroll.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
            payslips: {
                include: {
                    employee: {
                        select: {
                            nik: true,
                            user: { select: { username: true } }
                        }
                    }
                }
            }
        }
    });

    let totalNetSalary = 0, totalBasic = 0, totalOvertime = 0, totalDeductions = 0, pph21 = 0, bpjs = 0;

    if (latestPayroll) {
        latestPayroll.payslips.forEach(p => {
            totalNetSalary += parseFloat(p.netSalary || 0);
            totalBasic += parseFloat(p.basicSalary || 0);
            totalOvertime += parseFloat(p.overtimePay || 0);
            totalDeductions += parseFloat(p.totalDeductions || 0);
            pph21 += parseFloat(p.pph21 || 0);
            bpjs += parseFloat(p.bpjsKesehatan || 0) + parseFloat(p.bpjsKerja || 0) + parseFloat(p.jht || 0);
        });
    }

    const departments = await prismaClient.department.findMany({
        select: {
            name: true,
            _count: { select: { employees: true } }
        }
    });

    const donutData = departments.map(d => ({
        name: d.name,
        value: d._count.employees
    }));

    const recentPayrolls = await prismaClient.payroll.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
            payslips: { select: { netSalary: true } }
        }
    });

    const chartData = recentPayrolls.reverse().map(p => ({
        period: p.period,
        label: p.period,
        value: p.payslips.reduce((sum, s) => sum + parseFloat(s.netSalary || 0), 0)
    }));

    const recentOvertimes = await prismaClient.overtime.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
            employee: {
                select: {
                    nik: true,
                    user: { select: { username: true } }
                }
            }
        }
    });

    const tableData = recentOvertimes.map(ot => ({
        id: ot.id,
        nama: ot.employee?.user?.username || '-',
        initials: (ot.employee?.user?.username || '?')[0].toUpperCase(),
        color: 'bg-blue-500',
        tanggal: ot.date,
        totalHours: ot.totalHours || 0,
        jam: ot.totalHours ? `${ot.totalHours} Jam` : '-',
        status: ot.status,
        keterangan: ot.reason || '-'
    }));

    const activityData = [];
    recentOvertimes.slice(0, 3).forEach(ot => {
        activityData.push({
            icon: 'Clock',
            color: ot.status === 'PENDING' ? 'bg-amber-500' : ot.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-red-500',
            title: `Lembur ${ot.status === 'PENDING' ? 'diajukan' : ot.status === 'APPROVED' ? 'disetujui' : 'ditolak'}`,
            desc: `${ot.employee?.user?.username || 'Karyawan'} - ${ot.reason || 'Lembur'}`,
            time: ot.createdAt
        });
    });

    if (latestPayroll) {
        activityData.push({
            icon: 'Wallet',
            color: 'bg-[#ff6b00]',
            title: 'Payroll diproses',
            desc: `Periode ${latestPayroll.period} - ${latestPayroll.payslips?.length || 0} karyawan`,
            time: latestPayroll.processedAt || latestPayroll.createdAt
        });
    }

    const payrollSummary = latestPayroll ? {
        items: [
            { label: 'Gaji Pokok', value: totalBasic, color: 'bg-blue-500' },
            { label: 'Lembur', value: totalOvertime, color: 'bg-emerald-500' },
            { label: 'BPJS', value: bpjs, color: 'bg-amber-500' },
            { label: 'PPh 21', value: pph21, color: 'bg-red-500' },
            { label: 'Potongan', value: totalDeductions, color: 'bg-gray-500' },
        ],
        grandTotal: totalNetSalary,
        footerNote: latestPayroll.period,
        period: latestPayroll.period,
        status: 'Sudah diproses'
    } : null;

    return {
        stats: {
            totalKaryawan,
            totalDepartemen,
            totalPendingOvertime,
            totalNetSalary,
            totalOvertimeHours
        },
        donutData,
        chartData,
        tableData,
        activityData: activityData.length > 0 ? activityData : [],
        payrollSummary
    };
}

// Tambah di bawah fungsi getPayrollSummary (atau di akhir file)

export async function getPayrollPeriods() {
    const payrolls = await prismaClient.payroll.findMany({
        select: { period: true },
        orderBy: { period: 'desc' }
    });
    return payrolls.map(p => p.period);
}

export async function getPayrollByPeriod(period) {
    const payroll = await prismaClient.payroll.findUnique({
        where: { period },
        include: {
            payslips: true
        }
    });
    
    if (!payroll) return null;
    
    let totalNetSalary = 0, totalBasic = 0, totalOvertime = 0, totalDeductions = 0, pph21 = 0, bpjs = 0;
    payroll.payslips.forEach(p => {
        totalNetSalary += parseFloat(p.netSalary || 0);
        totalBasic += parseFloat(p.basicSalary || 0);
        totalOvertime += parseFloat(p.overtimePay || 0);
        totalDeductions += parseFloat(p.totalDeductions || 0);
        pph21 += parseFloat(p.pph21 || 0);
        bpjs += parseFloat(p.bpjsKesehatan || 0) + parseFloat(p.bpjsKerja || 0) + parseFloat(p.jht || 0);
    });
    
    return {
        items: [
            { label: 'Gaji Pokok', value: totalBasic, color: 'bg-blue-500' },
            { label: 'Lembur', value: totalOvertime, color: 'bg-emerald-500' },
            { label: 'BPJS', value: bpjs, color: 'bg-amber-500' },
            { label: 'PPh 21', value: pph21, color: 'bg-red-500' },
            { label: 'Potongan', value: totalDeductions, color: 'bg-gray-500' },
        ],
        grandTotal: totalNetSalary,
        footerNote: `Periode ${payroll.period}`,
        period: payroll.period,
        status: 'Sudah diproses'
    };
}

export async function getAllPayrollsAggregate() {
    const payrolls = await prismaClient.payroll.findMany({
        include: {
            payslips: true
        }
    });
    
    if (!payrolls || payrolls.length === 0) return null;
    
    let totalNetSalary = 0, totalBasic = 0, totalOvertime = 0, totalDeductions = 0, pph21 = 0, bpjs = 0;
    const periodList = [];
    
    payrolls.forEach(payroll => {
        periodList.push(payroll.period);
        payroll.payslips.forEach(p => {
            totalNetSalary += parseFloat(p.netSalary || 0);
            totalBasic += parseFloat(p.basicSalary || 0);
            totalOvertime += parseFloat(p.overtimePay || 0);
            totalDeductions += parseFloat(p.totalDeductions || 0);
            pph21 += parseFloat(p.pph21 || 0);
            bpjs += parseFloat(p.bpjsKesehatan || 0) + parseFloat(p.bpjsKerja || 0) + parseFloat(p.jht || 0);
        });
    });
    
    return {
        items: [
            { label: 'Gaji Pokok', value: totalBasic, color: 'bg-blue-500' },
            { label: 'Lembur', value: totalOvertime, color: 'bg-emerald-500' },
            { label: 'BPJS', value: bpjs, color: 'bg-amber-500' },
            { label: 'PPh 21', value: pph21, color: 'bg-red-500' },
            { label: 'Potongan', value: totalDeductions, color: 'bg-gray-500' },
        ],
        grandTotal: totalNetSalary,
        footerNote: `Gabungan ${payrolls.length} periode: ${periodList.join(', ')}`,
        period: 'all',
        status: 'Sudah diproses'
    };
}

export default { getStats, getPayrollPeriods, getPayrollByPeriod, getAllPayrollsAggregate };