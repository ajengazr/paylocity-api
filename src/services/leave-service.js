import { prismaClient } from "../application/db.js";
import { createLeaveValidation, updateLeaveStatusValidation, getLeaveValidation } from "../validations/leave-validation.js";
import { validate } from "../validations/validation.js";
import { ResponseError } from "../errors/response.error.js";

// ============ HELPER: Hitung Total Hari Kerja ============
function calculateWorkDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end     = new Date(endDate);

    while (current <= end) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) count++;
        current.setDate(current.getDate() + 1);
    }

    return count;
}

// ============ SELECT REUSABLE ============
const leaveSelect = {
    id:           true,
    type:         true,
    startDate:    true,
    endDate:      true,
    totalDays:    true,
    reason:       true,
    status:       true,
    rejectedNote: true,
    createdAt:    true,
    updatedAt:    true,
    employee: {
        select: {
            id:  true,
            nik: true,
            user: {
                select: {
                    username: true,
                    email:    true
                }
            },
            department: { select: { name: true } },
            position:   { select: { name: true } }
        }
    }
};

// ============ HELPER: Ambil atau Buat Record Leave Tahunan ============
async function getOrCreateLeaveRecord(employeeId, year) {
    let leaveRecord = await prismaClient.leave.findUnique({
        where: {
            employeeId_year: { employeeId, year }
        }
    });

    // Kalau belum ada, buat otomatis dengan jatah 12 hari
    if (!leaveRecord) {
        leaveRecord = await prismaClient.leave.create({
            data: {
                employeeId,
                year,
                totalDays:     12,
                usedDays:      0,
                remainingDays: 12
            }
        });
    }

    return leaveRecord;
}

// ============ CREATE (Employee ajukan cuti) ============
async function create(userId, req) {
    req = validate(createLeaveValidation, req);

    const employee = await prismaClient.employee.findUnique({
        where: { userId }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    // Cek konflik tanggal
    const conflictingLeave = await prismaClient.leaveRequest.findFirst({
        where: {
            employeeId: employee.id,
            status:     { in: ["PENDING", "APPROVED"] },
            AND: [{
                OR: [
                    {
                        startDate: { lte: new Date(req.startDate) },
                        endDate:   { gte: new Date(req.startDate) }
                    },
                    {
                        startDate: { lte: new Date(req.endDate) },
                        endDate:   { gte: new Date(req.endDate) }
                    },
                    {
                        startDate: { gte: new Date(req.startDate) },
                        endDate:   { lte: new Date(req.endDate) }
                    }
                ]
            }]
        }
    });

    if (conflictingLeave) {
        throw new ResponseError(400, "Tanggal cuti bentrok dengan pengajuan cuti lain yang sudah ada.");
    }

    const totalDays = calculateWorkDays(req.startDate, req.endDate);

    if (totalDays === 0) {
        throw new ResponseError(400, "Tidak ada hari kerja dalam rentang tanggal yang dipilih.");
    }

    // Kalau tipe TAHUNAN, validasi sisa cuti dulu
    if (req.type === "TAHUNAN") {
        const year        = new Date(req.startDate).getFullYear();
        const leaveRecord = await getOrCreateLeaveRecord(employee.id, year);

        if (leaveRecord.remainingDays < totalDays) {
            throw new ResponseError(400,
                `Sisa cuti tahunan tidak mencukupi. Sisa: ${leaveRecord.remainingDays} hari, dibutuhkan: ${totalDays} hari.`
            );
        }
    }

    return prismaClient.leaveRequest.create({
        data: {
            employeeId: employee.id,
            type:       req.type,
            startDate:  new Date(req.startDate),
            endDate:    new Date(req.endDate),
            totalDays,
            reason:     req.reason,
            status:     "PENDING"
        },
        select: leaveSelect
    });
}

// ============ GET ALL (HR Admin lihat semua) ============
async function getAll() {
    return prismaClient.leaveRequest.findMany({
        select:  leaveSelect,
        orderBy: { createdAt: "desc" }
    });
}

// ============ GET MY LEAVES (Employee lihat miliknya) ============
async function getMyLeaves(userId) {
    const employee = await prismaClient.employee.findUnique({
        where: { userId }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    return prismaClient.leaveRequest.findMany({
        where:   { employeeId: employee.id },
        select:  leaveSelect,
        orderBy: { createdAt: "desc" }
    });
}

// ============ GET BY ID ============
async function getById(leaveId) {
    leaveId = validate(getLeaveValidation, leaveId);

    const leave = await prismaClient.leaveRequest.findUnique({
        where:  { id: leaveId },
        select: leaveSelect
    });

    if (!leave) {
        throw new ResponseError(404, "Pengajuan cuti tidak ditemukan.");
    }

    return leave;
}

// ============ UPDATE STATUS (HR approve/reject) ============
async function updateStatus(leaveId, req) {
    leaveId = validate(getLeaveValidation, leaveId);
    req     = validate(updateLeaveStatusValidation, req);

    const leave = await prismaClient.leaveRequest.findUnique({
        where: { id: leaveId }
    });

    if (!leave) {
        throw new ResponseError(404, "Pengajuan cuti tidak ditemukan.");
    }

    if (leave.status !== "PENDING") {
        throw new ResponseError(400, "Hanya pengajuan dengan status PENDING yang bisa diubah.");
    }

    // Kalau APPROVED dan tipe TAHUNAN → kurangi remainingDays
    if (req.status === "APPROVED" && leave.type === "TAHUNAN") {
        const year        = new Date(leave.startDate).getFullYear();
        const leaveRecord = await getOrCreateLeaveRecord(leave.employeeId, year);

        // Validasi ulang saat approve — antisipasi race condition
        if (leaveRecord.remainingDays < leave.totalDays) {
            throw new ResponseError(400,
                `Sisa cuti tahunan tidak mencukupi. Sisa: ${leaveRecord.remainingDays} hari, dibutuhkan: ${leave.totalDays} hari.`
            );
        }

        // Kurangi dalam transaksi supaya atomic
        return prismaClient.$transaction(async (tx) => {
            // Update leave record
            await tx.leave.update({
                where: {
                    employeeId_year: {
                        employeeId: leave.employeeId,
                        year
                    }
                },
                data: {
                    usedDays:      { increment: leave.totalDays },
                    remainingDays: { decrement: leave.totalDays }
                }
            });

            // Update status request
            return tx.leaveRequest.update({
                where: { id: leaveId },
                data:  {
                    status:       req.status,
                    rejectedNote: null
                },
                select: leaveSelect
            });
        });
    }

    // Kalau REJECTED dan sebelumnya APPROVED dan tipe TAHUNAN → kembalikan remainingDays
    // Note: case ini tidak mungkin terjadi karena hanya PENDING yang bisa diubah
    // Tapi handle untuk keamanan

    // Update status biasa (REJECTED atau tipe bukan TAHUNAN)
    return prismaClient.leaveRequest.update({
        where: { id: leaveId },
        data:  {
            status:       req.status,
            rejectedNote: req.rejectedNote || null
        },
        select: leaveSelect
    });
}

// ============ DELETE (Employee batalkan, hanya PENDING) ============
async function remove(userId, leaveId) {
    leaveId = validate(getLeaveValidation, leaveId);

    const employee = await prismaClient.employee.findUnique({
        where: { userId }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    const leave = await prismaClient.leaveRequest.findUnique({
        where: { id: leaveId }
    });

    if (!leave) {
        throw new ResponseError(404, "Pengajuan cuti tidak ditemukan.");
    }

    if (leave.employeeId !== employee.id) {
        throw new ResponseError(403, "Anda tidak memiliki akses untuk membatalkan pengajuan ini.");
    }

    if (leave.status !== "PENDING") {
        throw new ResponseError(400, "Hanya pengajuan dengan status PENDING yang bisa dibatalkan.");
    }

    return prismaClient.leaveRequest.delete({
        where: { id: leaveId }
    });
}

export default { create, getAll, getMyLeaves, getById, updateStatus, remove };