import { prismaClient } from "../application/db.js";
import { createPositionValidation, updatePositionValidation, getPositionValidation } from "../validations/position-validation.js";
import { validate } from "../validations/validation.js";
import { ResponseError } from "../errors/response.error.js";

// Validasi ID agar konsisten
function validateId(id, fieldName = "ID") {
    const num = parseInt(id);
    if (isNaN(num) || num <= 0) {
        throw new ResponseError(400, `${fieldName} tidak valid.`);
    }
    return num;
}

// Membuat jabatan baru dalam suatu departemen
async function create(req) {
    req = validate(createPositionValidation, req);

    // Cek apakah departemen yang dipilih ada
    const department = await prismaClient.department.findUnique({
        where: { id: req.departmentId }
    });

    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }

    // Cek apakah nama jabatan sudah ada di departemen yang sama
    const nameExists = await prismaClient.position.count({
        where: {
            name: req.name,
            departmentId: req.departmentId
        }
    });

    if (nameExists > 0) {
        throw new ResponseError(400, "Nama jabatan sudah ada di departemen ini.");
    }

    return prismaClient.position.create({
        data: {
            name: req.name,
            departmentId: req.departmentId
        },
        select: {
            id: true,
            name: true,
            department: {
                select: {
                    id: true,
                    name: true
                }
            },
            createdAt: true
        }
    });
}

// Mendapatkan semua jabatan dengan jumlah karyawan
async function getAll() {
    return prismaClient.position.findMany({
        select: {
            id: true,
            name: true,
            department: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: { employees: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}

// Mendapatkan jabatan berdasarkan departemen
async function getByDepartment(departmentId) {
    departmentId = validateId(departmentId, "Department ID");

    const department = await prismaClient.department.findUnique({
        where: { id: departmentId }
    });

    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }

    return prismaClient.position.findMany({
        where: { departmentId },
        select: {
            id: true,
            name: true,
            _count: {
                select: { employees: true }
            }
        },
        orderBy: { name: 'asc' }
    });
}

// Mendapatkan satu jabatan berdasarkan ID
async function getById(positionId) {
    positionId = validateId(positionId, "Position ID");

    const position = await prismaClient.position.findUnique({
        where: { id: positionId },
        select: {
            id: true,
            name: true,
            department: {
                select: {
                    id: true,
                    name: true
                }
            },
            _count: {
                select: { employees: true }
            }
        }
    });

    if (!position) {
        throw new ResponseError(404, "Jabatan tidak ditemukan.");
    }

    return position;
}

// Mengupdate jabatan (nama dan/atau departemen)
async function update(positionId, req) {
    positionId = validateId(positionId, "Position ID");
    req = validate(updatePositionValidation, req);

    const position = await prismaClient.position.findUnique({
        where: { id: positionId }
    });

    if (!position) {
        throw new ResponseError(404, "Jabatan tidak ditemukan.");
    }

    // Jika departmentId diubah, cek apakah departemen baru ada
    if (req.departmentId) {
        const department = await prismaClient.department.findUnique({
            where: { id: req.departmentId }
        });

        if (!department) {
            throw new ResponseError(404, "Departemen tidak ditemukan.");
        }
    }

    // Jika nama diubah, cek duplikat di departemen yang sama
    if (req.name) {
        const targetDepartmentId = req.departmentId || position.departmentId;

        const nameExists = await prismaClient.position.count({
            where: {
                name: req.name,
                departmentId: targetDepartmentId,
                NOT: { id: positionId }
            }
        });

        if (nameExists > 0) {
            throw new ResponseError(400, "Nama jabatan sudah ada di departemen ini.");
        }
    }

    return prismaClient.position.update({
        where: { id: positionId },
        data: {
            ...(req.name && { name: req.name }),
            ...(req.departmentId && { departmentId: req.departmentId })
        },
        select: {
            id: true,
            name: true,
            department: {
                select: {
                    id: true,
                    name: true
                }
            },
            updatedAt: true
        }
    });
}

// Menghapus jabatan (hanya jika tidak ada karyawan yang menggunakan)
async function remove(positionId) {
    positionId = validateId(positionId, "Position ID");

    const position = await prismaClient.position.findUnique({
        where: { id: positionId }
    });

    if (!position) {
        throw new ResponseError(404, "Jabatan tidak ditemukan.");
    }

    // Cek apakah masih ada karyawan yang menempati jabatan ini
    const employeeCount = await prismaClient.employee.count({
        where: { positionId }
    });

    if (employeeCount > 0) {
        throw new ResponseError(400, `Jabatan tidak bisa dihapus, masih ada ${employeeCount} karyawan.`);
    }

    return prismaClient.position.delete({
        where: { id: positionId }
    });
}

export default { create, getAll, getById, getByDepartment, update, remove };