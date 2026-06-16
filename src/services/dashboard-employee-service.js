import { prismaClient } from "../application/db.js";
import { ResponseError } from "../errors/response.error.js";

export async function getDashboard(userId) {
    const employee = await prismaClient.employee.findFirst({
        where: { userId },
        select: { id: true, basicSalary: true, taxStatus: true, userId: true }
    });

    if (!employee) throw new ResponseError(404, "Employee tidak ditemukan");

    const [stats, chartData, donutData, overtimeHistory, activityLog, payrollSummary] = await Promise.all([
        getStats(employee),
        getChartData(employee.id),
        getDonutData(employee.id),
        getOvertimeHistory(employee.id),
        getActivityLog(employee.id),
        getPayrollSummary(employee.id)
    ]);

    return { stats, chartData, donutData, overtimeHistory, activityLog, payrollSummary };
}

export async function getStats(employee) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const period = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentDate = now.getDate();

    const payroll = await prismaClient.payroll.findUnique({
        where: { period },
        include: { payslips: { where: { employeeId: employee.id } } }
    });

    let currentSalary = 0, salaryStatus = "BELUM_PROSES";
    if (payroll && payroll.payslips.length > 0) {
        currentSalary = Number(payroll.payslips[0].netSalary);
        salaryStatus = "SUDAH_PROSES";
    } else if (currentDate >= 28) {
        salaryStatus = "BELUM_DIPROSES_ADMIN";
    }

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    const startOfYear = new Date(currentYear, 0, 1);

    const approvedOvertimeAgg = await prismaClient.overtime.aggregate({
        where: {
            employeeId: employee.id,
            status: "APPROVED",
            date: { gte: startOfYear, lte: endOfMonth }
        },
        _sum: { totalHours: true }
    });
    const totalOvertimeHours = Number(approvedOvertimeAgg._sum.totalHours || 0);

    const totalOvertimeCount = await prismaClient.overtime.count({
        where: {
            employeeId: employee.id,
            date: { gte: startOfMonth, lte: endOfMonth }
        }
    });

    const pendingOvertimeCount = await prismaClient.overtime.count({
        where: {
            employeeId: employee.id,
            status: "PENDING",
            date: { gte: startOfMonth, lte: endOfMonth }
        }
    });

    let remainingLeave = 12;
    const leave = await prismaClient.leave.findUnique({
        where: { employeeId_year: { employeeId: employee.id, year: currentYear } }
    });
    if (leave) remainingLeave = leave.remainingDays;
    else {
        await prismaClient.leave.create({
            data: { employeeId: employee.id, totalDays: 12, usedDays: 0, remainingDays: 12, year: currentYear }
        });
    }

    let pphDeducted = 0;

    const yearlyPayslips = await prismaClient.payslip.findMany({
        where: {
            employeeId: employee.id,
            createdAt: { gte: startOfYear, lte: endOfMonth }
        },
        select: { pph21: true }
    });

    pphDeducted = yearlyPayslips.reduce((sum, ps) => sum + Number(ps.pph21 || 0), 0);

    return {
        currentSalary,
        salaryStatus,
        totalOvertimeHours,
        totalOvertimeCount,
        pendingOvertimeCount,
        remainingLeave,
        pphDeducted,
        basicSalary: Number(employee.basicSalary)
    };
}

export async function getChartData(employeeId) {
    const now = new Date();
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear(), month = date.getMonth() + 1;
        const period = `${year}-${String(month).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('id-ID', { month: 'short' });

        const payroll = await prismaClient.payroll.findUnique({
            where: { period },
            include: { payslips: { where: { employeeId } } }
        });

        let netSalary = 0;
        if (payroll && payroll.payslips.length > 0) netSalary = Number(payroll.payslips[0].netSalary);

        chartData.push({ month: monthName, year, salary: netSalary, period });
    }
    return chartData;
}

export async function getDonutData(employeeId) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const employee = await prismaClient.employee.findUnique({
        where: { id: employeeId },
        select: { basicSalary: true }
    });
    const basicSalary = Number(employee?.basicSalary || 0);

    const payroll = await prismaClient.payroll.findUnique({
        where: { period },
        include: { payslips: { where: { employeeId } } }
    });

    if (!payroll || payroll.payslips.length === 0) {
        return [
            { label: 'Gaji Pokok', value: basicSalary, color: '#ff6b00' },
            { label: 'Tunjangan', value: 0, color: '#1a2332' },
            { label: 'Lembur', value: 0, color: '#9ca3af' },
            { label: 'Potongan', value: 0, color: '#ef4444' }
        ];
    }

    const ps = payroll.payslips[0];
    const overtimePay = Number(ps.overtimePay || 0);
    const totalDeductions = Number(ps.totalDeductions || 0);
    const netSalary = Number(ps.netSalary || 0);

    let tunjangan = netSalary + totalDeductions - basicSalary - overtimePay;
    if (tunjangan < 0) tunjangan = 0;

    return [
        { label: 'Gaji Pokok', value: basicSalary, color: '#ff6b00' },
        { label: 'Tunjangan', value: tunjangan, color: '#1a2332' },
        { label: 'Lembur', value: overtimePay, color: '#9ca3af' },
        { label: 'Potongan', value: totalDeductions, color: '#ef4444' }
    ];
}

export async function getOvertimeHistory(employeeId, limit = 10) {
    const overtimes = await prismaClient.overtime.findMany({
        where: { employeeId },
        orderBy: { date: "desc" },
        take: limit,
        select: { id: true, date: true, totalHours: true, status: true, reason: true, overtimePay: true }
    });

    return overtimes.map(ot => {
        let statusText = ot.status === "APPROVED" ? "Disetujui" : ot.status === "PENDING" ? "Pending" : "Ditolak";
        return {
            id: ot.id,
            tanggal: ot.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            jam: `${ot.totalHours} jam`,
            status: statusText,
            keterangan: ot.reason || "-",
            honor: ot.overtimePay ? `Rp ${Number(ot.overtimePay).toLocaleString('id-ID')}` : "-"
        };
    });
}

export async function getActivityLog(employeeId, limit = 5) {
    const activities = [];
    const recentOvertimes = await prismaClient.overtime.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { status: true, createdAt: true, date: true, totalHours: true }
    });

    recentOvertimes.forEach(ot => {
        let statusText = "", statusColor = "";
        if (ot.status === "APPROVED") { statusText = "disetujui"; statusColor = "bg-emerald-500"; }
        else if (ot.status === "PENDING") { statusText = "diajukan"; statusColor = "bg-amber-500"; }
        else { statusText = "ditolak"; statusColor = "bg-red-500"; }

        activities.push({
            title: `Pengajuan Lembur ${statusText}`,
            desc: `${ot.totalHours} jam pada ${ot.date.toLocaleDateString('id-ID')}`,
            time: formatRelativeTime(ot.createdAt),
            icon: "Clock",
            color: statusColor
        });
    });

    const recentPayslips = await prismaClient.payslip.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        take: 2,
        include: { payroll: { select: { period: true } } }
    });

    recentPayslips.forEach(ps => {
        activities.push({
            title: `Slip Gaji ${ps.payroll.period} Tersedia`,
            desc: `Gaji bersih: Rp ${Number(ps.netSalary).toLocaleString('id-ID')}`,
            time: formatRelativeTime(ps.createdAt),
            icon: "Wallet",
            color: "bg-blue-500"
        });
    });

    activities.sort((a, b) => {
        const getPriority = (time) => {
            if (time === "Baru saja") return 0;
            const match = time.match(/(\d+)/);
            return match ? parseInt(match[1]) : 999;
        };
        return getPriority(a.time) - getPriority(b.time);
    });

    return activities.slice(0, limit);
}

export async function getPayrollSummary(employeeId, period) {
    const employee = await prismaClient.employee.findUnique({
        where: { id: employeeId },
        select: { basicSalary: true }
    });

    if (!employee) throw new ResponseError(404, "Employee tidak ditemukan");

    // AKUMULASI SEMUA PERIODE
    if (period === 'all') {
        const payslips = await prismaClient.payslip.findMany({
            where: { employeeId },
            include: { payroll: { select: { period: true } } },
            orderBy: { createdAt: 'desc' }
        });

        if (payslips.length === 0) {
            return {
                gajiPokok: Number(employee.basicSalary),
                tunjangan: 0,
                lembur: 0,
                potongan: 0,
                pph21: 0,
                takeHomePay: 0,
                status: "Belum diproses",
                period: "all"
            };
        }

        const sum = payslips.reduce((acc, ps) => ({
            gajiPokok: acc.gajiPokok + Number(ps.basicSalary || 0),
            lembur: acc.lembur + Number(ps.overtimePay || 0),
            potongan: acc.potongan + (Number(ps.totalDeductions || 0) - Number(ps.pph21 || 0)),
            pph21: acc.pph21 + Number(ps.pph21 || 0),
            takeHomePay: acc.takeHomePay + Number(ps.netSalary || 0)
        }), { gajiPokok: 0, lembur: 0, potongan: 0, pph21: 0, takeHomePay: 0 });

        return {
            ...sum,
            tunjangan: 0,
            status: "Akumulasi",
            period: "all"
        };
    }

    let targetPeriod = period;
    if (!targetPeriod) {
        const lastPayslip = await prismaClient.payslip.findFirst({
            where: { employeeId },
            include: { payroll: { select: { period: true } } },
            orderBy: { createdAt: 'desc' }
        });
        targetPeriod = lastPayslip?.payroll?.period;
    }

    const now = new Date();
    if (!targetPeriod) {
        targetPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const payroll = await prismaClient.payroll.findUnique({
        where: { period: targetPeriod },
        include: { payslips: { where: { employeeId } } }
    });

    let summary = {
        gajiPokok: Number(employee.basicSalary),
        tunjangan: 0,
        lembur: 0,
        potongan: 0,
        pph21: 0,
        takeHomePay: 0,
        status: "Belum diproses",
        period: targetPeriod
    };

    if (payroll && payroll.payslips.length > 0) {
        const ps = payroll.payslips[0];
        summary = {
            gajiPokok: Number(ps.basicSalary),
            tunjangan: 0,
            lembur: Number(ps.overtimePay),
            potongan: Number(ps.totalDeductions) - Number(ps.pph21),
            pph21: Number(ps.pph21),
            takeHomePay: Number(ps.netSalary),
            status: "Sudah diproses",
            period: targetPeriod
        };
    }

    return summary;
}

export async function getPayrollPeriods(employeeId) {
    const payslips = await prismaClient.payslip.findMany({
        where: { employeeId },
        include: { payroll: { select: { period: true } } },
        orderBy: { createdAt: 'desc' }
    });

    const periods = [...new Set(payslips.map(ps => ps.payroll.period))];
    return periods;
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return new Date(date).toLocaleDateString('id-ID');
}

export default {
    getDashboard,
    getStats,
    getChartData,
    getDonutData,
    getOvertimeHistory,
    getActivityLog,
    getPayrollSummary,
    getPayrollPeriods
};