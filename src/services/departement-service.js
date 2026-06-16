import { prismaClient } from "../application/db.js";
import { createDepartmentValidation, updateDepartmentValidation, getDepartmentValidation } from "../validations/departement-validation.js";
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

// ============ CREATE ============
// Membuat departemen baru
async function create(req) {
    req = validate(createDepartmentValidation, req);
    
    // Cek apakah nama departemen sudah terdaftar
    const nameExists = await prismaClient.department.count({ 
        where: { name: req.name } 
    });
    
    if (nameExists > 0) {
        throw new ResponseError(400, "Nama departemen sudah terdaftar.");
    }
    
    return prismaClient.department.create({
        data: { name: req.name },
        select: { id: true, name: true, createdAt: true }
    });
}

// ============ GET ALL ============
// Mendapatkan semua departemen beserta posisi dan jumlah karyawan
async function getAll() {
    return prismaClient.department.findMany({
        select: {
            id: true,
            name: true,
            createdAt: true,
            positions: { 
                select: { id: true, name: true } 
            },
            _count: { 
                select: { employees: true } 
            }
        },
        orderBy: { name: 'asc' }
    });
}

// ============ GET BY ID ============
// Mendapatkan detail satu departemen berdasarkan ID
async function getById(departmentId) {
    departmentId = validateId(departmentId, "Department ID");
    
    const department = await prismaClient.department.findUnique({
        where: { id: departmentId },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            positions: { 
                select: { id: true, name: true } 
            },
            _count: { 
                select: { employees: true } 
            }
        }
    });
    
    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }
    
    return department;
}

// ============ UPDATE ============
// Mengupdate nama departemen
async function update(departmentId, req) {
    departmentId = validateId(departmentId, "Department ID");
    req = validate(updateDepartmentValidation, req);
    
    // Cek apakah departemen ada
    const department = await prismaClient.department.findUnique({ 
        where: { id: departmentId } 
    });
    
    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }
    
    // Cek apakah nama baru sudah dipakai departemen lain
    const nameExists = await prismaClient.department.count({ 
        where: { 
            name: req.name, 
            NOT: { id: departmentId } 
        } 
    });
    
    if (nameExists > 0) {
        throw new ResponseError(400, "Nama departemen sudah digunakan.");
    }
    
    return prismaClient.department.update({
        where: { id: departmentId },
        data: { name: req.name },
        select: { id: true, name: true, updatedAt: true }
    });
}

// ============ DELETE ============
// Menghapus departemen (hanya jika tidak ada karyawan dan posisi di dalamnya)
async function remove(departmentId) {
    departmentId = validateId(departmentId, "Department ID");
    
    // Cek apakah departemen ada
    const department = await prismaClient.department.findUnique({ 
        where: { id: departmentId } 
    });
    
    if (!department) {
        throw new ResponseError(404, "Departemen tidak ditemukan.");
    }
    
    // Cek apakah masih ada karyawan di departemen ini
    const employeeCount = await prismaClient.employee.count({ 
        where: { departmentId } 
    });
    
    if (employeeCount > 0) {
        throw new ResponseError(400, `Departemen tidak bisa dihapus, masih ada ${employeeCount} karyawan.`);
    }
    
    // Cek apakah masih ada posisi di departemen ini
    const positionCount = await prismaClient.position.count({ 
        where: { departmentId } 
    });
    
    if (positionCount > 0) {
        throw new ResponseError(400, `Departemen tidak bisa dihapus, masih ada ${positionCount} posisi/jabatan.`);
    }
    
    return prismaClient.department.delete({ 
        where: { id: departmentId } 
    });
}

export default { create, getAll, getById, update, remove };