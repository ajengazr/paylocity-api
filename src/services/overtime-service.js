import { prismaClient } from "../application/db.js";
import {
    createOvertimeValidation,
    createOvertimeByAdminValidation,
    updateOvertimeByAdminValidation,
    updateOvertimeStatusValidation,
    getOvertimeValidation
} from "../validations/overtime-validation.js";
import { validate } from "../validations/validation.js";
import { ResponseError } from "../errors/response.error.js";
import { createNotification } from "./notification-service.js";

const WORK_END_TIME = "17:00";
const MIN_OVERTIME_HOURS = 1;
const MAX_WEEKDAY_HOURS = 4;
const MAX_WEEKEND_HOURS = 12;

function toMinutes(time) {
    const [hour, min] = time.split(":").map(Number);
    return hour * 60 + min;
}

function calculateTotalHours(startTime, endTime) {
    const startTotal = toMinutes(startTime);
    const endTotal = toMinutes(endTime);

    if (endTotal <= startTotal) {
        throw new ResponseError(400, "Jam selesai harus lebih besar dari jam mulai.");
    }

    return parseFloat(((endTotal - startTotal) / 60).toFixed(2));
}

function validateFutureDate(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(dateStr + 'T00:00:00');

    if (inputDate < today) {
        throw new ResponseError(400, "Tidak bisa mengajukan lembur untuk tanggal yang sudah lewat.");
    }
}

function validateOvertimeTime(startTime, endTime, dayType) {
    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);
    const workEndMinutes = toMinutes(WORK_END_TIME);

    if (dayType === "WEEKDAY" && startMinutes < workEndMinutes) {
        throw new ResponseError(400, `Lembur hari kerja hanya bisa dimulai setelah jam ${WORK_END_TIME}.`);
    }

    if (endMinutes <= startMinutes) {
        throw new ResponseError(400, "Jam selesai harus lebih besar dari jam mulai.");
    }

    const totalMinutes = endMinutes - startMinutes;
    const maxMinutes = dayType === "WEEKDAY" ? MAX_WEEKDAY_HOURS * 60 : MAX_WEEKEND_HOURS * 60;

    if (totalMinutes > maxMinutes) {
        const maxHours = maxMinutes / 60;
        throw new ResponseError(400, `Maksimal lembur ${dayType === "WEEKDAY" ? "hari kerja" : "weekend"} adalah ${maxHours} jam per hari.`);
    }
}

async function checkOverlappingOvertime(employeeId, date, startTime, endTime, excludeId = null) {
    const whereClause = {
        employeeId,
        date: new Date(date + 'T00:00:00'),
        status: { in: ['PENDING', 'APPROVED'] }
    };

    if (excludeId) {
        whereClause.id = { not: excludeId };
    }

    const existingOvertimes = await prismaClient.overtime.findMany({
        where: whereClause
    });

    for (const existing of existingOvertimes) {
        const existingStart = toMinutes(existing.startTime);
        const existingEnd = toMinutes(existing.endTime);
        const newStart = toMinutes(startTime);
        const newEnd = toMinutes(endTime);

        if (newStart < existingEnd && newEnd > existingStart) {
            throw new ResponseError(400, `Waktu lembur bentrok dengan pengajuan yang sudah ada (${existing.startTime} - ${existing.endTime}).`);
        }
    }
}

function calculateOvertimePay(basicSalary, totalHours, dayType) {
    if (!basicSalary || basicSalary <= 0) {
        throw new ResponseError(400, "Data gaji karyawan tidak valid untuk menghitung upah lembur.");
    }

    const hourlyRate = parseFloat(basicSalary) / 173;
    let overtimePay = 0;

    if (dayType === "WEEKDAY") {
        if (totalHours <= 1) {
            overtimePay = totalHours * 1.5 * hourlyRate;
        } else {
            overtimePay = (1.5 * hourlyRate) + ((totalHours - 1) * 2 * hourlyRate);
        }
    } else {
        if (totalHours <= 7) {
            overtimePay = totalHours * 2 * hourlyRate;
        } else if (totalHours <= 8) {
            overtimePay = (7 * 2 * hourlyRate) + ((totalHours - 7) * 3 * hourlyRate);
        } else {
            overtimePay = (7 * 2 * hourlyRate) + (1 * 3 * hourlyRate) + ((totalHours - 8) * 4 * hourlyRate);
        }
    }

    return parseFloat(overtimePay.toFixed(2));
}

function processOvertimeCalculation(basicSalary, startTime, endTime, dayType) {
    const totalHours = calculateTotalHours(startTime, endTime);

    if (totalHours < MIN_OVERTIME_HOURS) {
        throw new ResponseError(400, `Minimum lembur adalah ${MIN_OVERTIME_HOURS} jam.`);
    }

    const overtimePay = calculateOvertimePay(basicSalary, totalHours, dayType);

    return { totalHours, overtimePay };
}

async function create(userId, req) {
    req = validate(createOvertimeValidation, req);

    validateFutureDate(req.date);
    validateOvertimeTime(req.startTime, req.endTime, req.dayType);

    const employee = await prismaClient.employee.findUnique({ where: { userId } });
    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    const existingOvertime = await prismaClient.overtime.count({
        where: {
            employeeId: employee.id,
            date: new Date(req.date + 'T00:00:00'),
            status: { in: ['PENDING', 'APPROVED'] }
        }
    });

    if (existingOvertime > 0) {
        throw new ResponseError(400, "Sudah ada pengajuan lembur aktif di tanggal ini.");
    }

    await checkOverlappingOvertime(employee.id, req.date, req.startTime, req.endTime);

    const totalHours = calculateTotalHours(req.startTime, req.endTime);

    if (totalHours < MIN_OVERTIME_HOURS) {
        throw new ResponseError(400, `Minimum lembur adalah ${MIN_OVERTIME_HOURS} jam.`);
    }

    return prismaClient.overtime.create({
        data: {
            employeeId: employee.id,
            date: new Date(req.date + 'T00:00:00'),
            startTime: req.startTime,
            endTime: req.endTime,
            totalHours,
            dayType: req.dayType,
            reason: req.reason,
            status: "PENDING"
        },
        include: {
            employee: {
                select: {
                    id: true,
                    nik: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
}

async function createByAdmin(req) {
    req = validate(createOvertimeByAdminValidation, req);

    validateFutureDate(req.date);
    validateOvertimeTime(req.startTime, req.endTime, req.dayType);

    const employee = await prismaClient.employee.findUnique({
        where: { id: req.employeeId },
        include: { user: true }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    const existingOvertime = await prismaClient.overtime.count({
        where: {
            employeeId: employee.id,
            date: new Date(req.date + 'T00:00:00'),
            status: { in: ['PENDING', 'APPROVED'] }
        }
    });

    if (existingOvertime > 0) {
        throw new ResponseError(400, "Employee sudah memiliki data lembur aktif di tanggal ini.");
    }

    await checkOverlappingOvertime(employee.id, req.date, req.startTime, req.endTime);

    const { totalHours, overtimePay } = processOvertimeCalculation(
        employee.basicSalary,
        req.startTime,
        req.endTime,
        req.dayType
    );

    const overtime = await prismaClient.overtime.create({
        data: {
            employeeId: employee.id,
            date: new Date(req.date + 'T00:00:00'),
            startTime: req.startTime,
            endTime: req.endTime,
            totalHours,
            dayType: req.dayType,
            reason: req.reason,
            status: "APPROVED",
            overtimePay
        },
        include: {
            employee: {
                select: {
                    id: true,
                    nik: true,
                    basicSalary: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    await createNotification({
        userId: employee.user.id,
        title: 'Pengajuan Lembur Disetujui',
        message: `Pengajuan lembur Anda tanggal ${req.date} telah disetujui oleh admin. Estimasi bayaran: Rp ${overtimePay.toLocaleString('id-ID')}.`,
        type: 'success'
    });

    return overtime;
}

async function updateByAdmin(overtimeId, req) {
    overtimeId = validate(getOvertimeValidation, overtimeId);
    req = validate(updateOvertimeByAdminValidation, req);

    const overtime = await prismaClient.overtime.findUnique({
        where: { id: overtimeId },
        include: { employee: true }
    });

    if (!overtime) {
        throw new ResponseError(404, "Data lembur tidak ditemukan.");
    }

    if (overtime.payrollId !== null) {
        throw new ResponseError(400, "Lembur yang sudah diproses dalam payroll tidak bisa diubah.");
    }

    const newDate = req.date || overtime.date.toISOString().split('T')[0];
    const newStartTime = req.startTime || overtime.startTime;
    const newEndTime = req.endTime || overtime.endTime;
    const newDayType = req.dayType || overtime.dayType;
    const newReason = req.reason || overtime.reason;

    if (req.date) {
        validateFutureDate(req.date);
    }

    validateOvertimeTime(newStartTime, newEndTime, newDayType);

    await checkOverlappingOvertime(overtime.employeeId, newDate, newStartTime, newEndTime, overtimeId);

    const { totalHours, overtimePay } = processOvertimeCalculation(
        overtime.employee.basicSalary,
        newStartTime,
        newEndTime,
        newDayType
    );

    return prismaClient.overtime.update({
        where: { id: overtimeId },
        data: {
            date: new Date(newDate + 'T00:00:00'),
            startTime: newStartTime,
            endTime: newEndTime,
            totalHours,
            dayType: newDayType,
            reason: newReason,
            overtimePay
        },
        include: {
            employee: {
                select: {
                    id: true,
                    nik: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }
        }
    });
}

async function getAll() {
    return prismaClient.overtime.findMany({
        include: {
            employee: {
                select: {
                    id: true,
                    nik: true,
                    basicSalary: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    position: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { date: "desc" },
            { createdAt: "desc" }
        ]
    });
}

async function getMyOvertime(userId) {
    const employee = await prismaClient.employee.findUnique({
        where: { userId },
        select: { id: true }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    return prismaClient.overtime.findMany({
        where: { employeeId: employee.id },
        orderBy: { date: "desc" }
    });
}

async function getById(overtimeId) {
    overtimeId = validate(getOvertimeValidation, overtimeId);

    const overtime = await prismaClient.overtime.findUnique({
        where: { id: overtimeId },
        include: {
            employee: {
                select: {
                    id: true,
                    nik: true,
                    basicSalary: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    },
                    department: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    position: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!overtime) {
        throw new ResponseError(404, "Data lembur tidak ditemukan.");
    }

    return overtime;
}

async function updateStatus(overtimeId, req, adminUserId = null) {
    overtimeId = validate(getOvertimeValidation, overtimeId);
    req = validate(updateOvertimeStatusValidation, req);

    const overtime = await prismaClient.overtime.findUnique({
        where: { id: overtimeId },
        include: {
            employee: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    if (!overtime) {
        throw new ResponseError(404, "Data lembur tidak ditemukan.");
    }

    if (overtime.status !== "PENDING") {
        throw new ResponseError(400, "Hanya pengajuan dengan status PENDING yang bisa diubah.");
    }

    if (overtime.payrollId !== null) {
        throw new ResponseError(400, "Lembur yang sudah diproses dalam payroll tidak bisa diubah statusnya.");
    }

    let overtimePay = null;
    if (req.status === "APPROVED") {
        overtimePay = calculateOvertimePay(
            overtime.employee.basicSalary,
            parseFloat(overtime.totalHours),
            overtime.dayType
        );
    }

    const updatedOvertime = await prismaClient.overtime.update({
        where: { id: overtimeId },
        data: {
            status: req.status,
            ...(overtimePay !== null && { overtimePay }),
        },
        include: {
            employee: {
                select: {
                    id:  true,
                    nik: true,
                    user: {
                        select: {
                            id:       true,
                            username: true,
                            email:    true
                        }
                    }
                }
            }
        }
    });

    const isApproved = req.status === "APPROVED";

    // ✅ Fix: overtime.employee.user.id bukan overtime.employee.user.user.id
    await createNotification({
        userId:  overtime.employee.user.id,
        title:   isApproved ? 'Pengajuan Lembur Disetujui' : 'Pengajuan Lembur Ditolak',
        message: isApproved
            ? `Pengajuan lembur Anda tanggal ${overtime.date.toISOString().split('T')[0]} telah disetujui. Estimasi bayaran: Rp ${overtimePay?.toLocaleString('id-ID') || 0}.`
            : `Maaf, pengajuan lembur Anda tanggal ${overtime.date.toISOString().split('T')[0]} telah ditolak.`,
        type: isApproved ? 'success' : 'info'
    });

    return updatedOvertime;
}

async function remove(userId, overtimeId) {
    overtimeId = validate(getOvertimeValidation, overtimeId);

    // Cek user yang login
    const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (!user) {
        throw new ResponseError(404, "User tidak ditemukan.");
    }

    const employee = await prismaClient.employee.findUnique({
        where: { userId },
        select: { id: true }
    });

    const overtime = await prismaClient.overtime.findUnique({
        where: { id: overtimeId },
        select: {
            id: true,
            employeeId: true,
            status: true,
            payrollId: true
        }
    });

    if (!overtime) {
        throw new ResponseError(404, "Data lembur tidak ditemukan.");
    }

    // SUPER_ADMIN bisa hapus semua lembur
    if (user.role !== 'SUPER_ADMIN') {
        // Cek akses untuk non-admin
        if (!employee || overtime.employeeId !== employee.id) {
            throw new ResponseError(403, "Anda tidak memiliki akses untuk membatalkan lembur ini.");
        }

        // Cek status untuk karyawan biasa
        if (overtime.status !== "PENDING") {
            throw new ResponseError(400, "Hanya pengajuan dengan status PENDING yang bisa dibatalkan.");
        }
    }

    // SUPER_ADMIN tetap bisa hapus meskipun sudah APPROVED, tapi tidak jika sudah masuk payroll
    if (overtime.payrollId !== null) {
        throw new ResponseError(400, "Lembur yang sudah diproses dalam payroll tidak bisa dibatalkan.");
    }

    return prismaClient.overtime.delete({
        where: { id: overtimeId },
        select: {
            id: true,
            date: true,
            status: true
        }
    });
}

export default {
    create,
    createByAdmin,
    updateByAdmin,
    getAll,
    getMyOvertime,
    getById,
    updateStatus,
    remove
};