import { prismaClient } from "../application/db.js";
import { createEmployeeValidation, deleteEmployeeValidation, getEmployeeValidation, updateEmployeeValidation } from "../validations/employee-validation.js";
import { validate } from "../validations/validation.js";
import argon2 from "argon2";
import { ResponseError } from "../errors/response.error.js";

const employeeSelect = {
    id: true,
    nik: true,
    phone: true,
    address: true,
    basicSalary: true,
    taxStatus: true,
    status: true,
    joinDate: true,
    createdAt: true,
    updatedAt: true,
    user: {
        select: {
            id: true,
            username: true,
            email: true,
            role: true
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
};

// Validasi ID
function validateId(id, fieldName = "ID") {
    const num = parseInt(id);
    if (isNaN(num) || num <= 0) {
        throw new ResponseError(400, `${fieldName} tidak valid.`);
    }
    return num;
}

// ============ CREATE ============
// Membuat employee baru beserta user account dan jatah cuti
async function create(req) {
    req = validate(createEmployeeValidation, req);

    // Cek apakah email sudah terdaftar
    const emailExists = await prismaClient.user.count({
        where: { email: req.email }
    });

    if (emailExists > 0) {
        throw new ResponseError(400, "Email sudah terdaftar.");
    }

    // Cek apakah NIK sudah terdaftar
    const nikExists = await prismaClient.employee.count({
        where: { nik: req.nik }
    });

    if (nikExists > 0) {
        throw new ResponseError(400, "NIK sudah terdaftar.");
    }

    // Cek apakah departemen ada
    const department = await prismaClient.department.findUnique({
        where: { id: req.departmentId }
    });

    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }

    // Cek apakah jabatan ada dan sesuai dengan departemen yang dipilih
    const position = await prismaClient.position.findFirst({
        where: {
            id: req.positionId,
            departmentId: req.departmentId
        }
    });

    if (!position) {
        throw new ResponseError(404, "Jabatan tidak ditemukan atau tidak sesuai dengan departemen.");
    }

    // Hash password
    const hashedPassword = await argon2.hash(req.password);

    // Proses dalam transaction agar data konsisten
    return prismaClient.$transaction(async (prisma) => {
        // Buat user account
        const user = await prisma.user.create({
            data: {
                username: req.username,
                email: req.email,
                password: hashedPassword,
                role: "EMPLOYEE"
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true
            }
        });

        // Buat data employee
        const employee = await prisma.employee.create({
            data: {
                userId: user.id,
                nik: req.nik,
                departmentId: req.departmentId,
                positionId: req.positionId,
                basicSalary: req.basicSalary,
                taxStatus: req.taxStatus,
                joinDate: new Date(req.joinDate)
            }
        });

        // Buat jatah cuti awal (12 hari per tahun)
        const currentYear = new Date().getFullYear();
        await prisma.leave.create({
            data: {
                employeeId: employee.id,
                totalDays: 12,
                usedDays: 0,
                remainingDays: 12,
                year: currentYear
            }
        });

        return {
            id: employee.id,
            username: user.username,
            email: user.email,
            role: user.role,
            nik: employee.nik,
            department: { id: department.id, name: department.name },
            position: { id: position.id, name: position.name },
            basicSalary: employee.basicSalary,
            taxStatus: employee.taxStatus,
            joinDate: employee.joinDate
        };
    });
}

// ============ GET ALL ============
// Mendapatkan semua data employee
async function getAll() {
    return prismaClient.employee.findMany({
        select: employeeSelect,
        orderBy: { createdAt: 'desc' }
    });
}

// ============ GET BY ID ============
// Mendapatkan satu employee berdasarkan ID
async function getById(employeeId) {
    employeeId = validateId(employeeId, "Employee ID");

    const employee = await prismaClient.employee.findUnique({
        where: { id: employeeId },
        select: employeeSelect
    });

    if (!employee) {
        throw new ResponseError(404, "Employee tidak ditemukan.");
    }

    return employee;
}

// ============ UPDATE ============
// Mengupdate data employee (untuk admin)
async function update(employeeId, req) {
    employeeId = validateId(employeeId, "Employee ID");
    req = validate(updateEmployeeValidation, req);

    // Cek apakah employee ada
    const employee = await prismaClient.employee.findUnique({
        where: { id: employeeId }
    });

    if (!employee) {
        throw new ResponseError(404, "Employee tidak ditemukan.");
    }

    // Jika ada perubahan department atau position, pastikan jabatan sesuai dengan departemen
    if (req.departmentId || req.positionId) {
        const targetDepartmentId = req.departmentId || employee.departmentId;
        const targetPositionId = req.positionId || employee.positionId;

        const position = await prismaClient.position.findFirst({
            where: {
                id: targetPositionId,
                departmentId: targetDepartmentId
            }
        });

        if (!position) {
            throw new ResponseError(404, "Jabatan tidak sesuai dengan departemen.");
        }
    }

    return prismaClient.$transaction(async (tx) => {
        // Update username di tabel user jika ada
        if (req.username) {
            await tx.user.update({
                where: { id: employee.userId },
                data: { username: req.username }
            });
        }

        // Update data employee
        return tx.employee.update({
            where: { id: employeeId },
            data: {
                ...(req.departmentId && { departmentId: req.departmentId }),
                ...(req.positionId && { positionId: req.positionId }),
                ...(req.basicSalary && { basicSalary: req.basicSalary }),
                ...(req.taxStatus && { taxStatus: req.taxStatus }),
                ...(req.status && { status: req.status })
            },
            select: employeeSelect
        });
    });
}

// ============ DELETE ============
// Menghapus employee (beserta user karena cascade)
async function remove(employeeId) {
    employeeId = validateId(employeeId, "Employee ID");

    const employee = await prismaClient.employee.findUnique({
        where: { id: employeeId }
    });

    if (!employee) {
        throw new ResponseError(404, "Employee tidak ditemukan.");
    }

    const payslipCount = await prismaClient.payslip.count({
        where: { employeeId }
    });

    if (payslipCount > 0) {
        throw new ResponseError(400,
            `Karyawan tidak bisa dihapus karena sudah memiliki ${payslipCount} data payslip. ` +
            `Hapus payroll terlebih dahulu atau nonaktifkan karyawan saja.`
        );
    }

    // Hapus user, employee akan otomatis terhapus karena onDelete: Cascade
    return prismaClient.user.delete({
        where: { id: employee.userId }
    });
}

// ============ GET BY USER ID ============
// Mendapatkan data employee berdasarkan user ID (untuk karyawan yang login)
async function getByUserId(userId) {
    userId = validateId(userId, "User ID");

    const employee = await prismaClient.employee.findUnique({
        where: { userId },
        select: employeeSelect
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    return employee;
}

// ============ UPDATE BY USER ID ============
// Karyawan mengupdate data diri sendiri (profil)
async function updateByUserId(userId, req) {
    userId = validateId(userId, "User ID");

    const employee = await prismaClient.employee.findUnique({
        where: { userId }
    });

    if (!employee) {
        throw new ResponseError(404, "Data employee tidak ditemukan.");
    }

    // Update data user (username, email, password)
    if (req.username || req.email || req.currentPassword) {
        const updateUserData = {};

        if (req.username) updateUserData.username = req.username;
        if (req.email) updateUserData.email = req.email;

        // Jika ingin ganti password, harus verifikasi password lama dulu
        if (req.newPassword) {
            const user = await prismaClient.user.findUnique({
                where: { id: userId }
            });

            const isValid = await argon2.verify(user.password, req.currentPassword);
            if (!isValid) {
                throw new ResponseError(401, "Password saat ini salah");
            }

            updateUserData.password = await argon2.hash(req.newPassword);
        }

        if (Object.keys(updateUserData).length > 0) {
            await prismaClient.user.update({
                where: { id: userId },
                data: updateUserData
            });
        }
    }

    // Update data employee (phone, address, taxStatus)
    const updateEmployeeData = {};
    if (req.phone !== undefined) updateEmployeeData.phone = req.phone;
    if (req.address !== undefined) updateEmployeeData.address = req.address;
    if (req.taxStatus) updateEmployeeData.taxStatus = req.taxStatus;

    if (Object.keys(updateEmployeeData).length > 0) {
        await prismaClient.employee.update({
            where: { userId },
            data: updateEmployeeData
        });
    }

    // Return data terbaru
    return prismaClient.employee.findUnique({
        where: { userId },
        select: employeeSelect
    });
}

export default { create, getAll, getById, update, remove, getByUserId, updateByUserId };