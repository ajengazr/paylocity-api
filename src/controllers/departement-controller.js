import departmentService from "../services/departement-service.js";

async function createDepartment(req, res, next) {
    try {
        const result = await departmentService.create(req.body);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllDepartments(req, res, next) {
    try {
        const result = await departmentService.getAll();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getDepartmentById(req, res, next) {
    try {
        const departmentId = parseInt(req.params.id);
        const result = await departmentService.getById(departmentId);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updateDepartment(req, res, next) {
    try {
        const departmentId = parseInt(req.params.id);
        const result = await departmentService.update(departmentId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function removeDepartment(req, res, next) {
    try {
        const departmentId = parseInt(req.params.id);
        await departmentService.remove(departmentId);
        return res.status(200).json({
            success: true,
            data: "Departemen berhasil dihapus."
        });
    } catch (error) {
        next(error);
    }
}

export default { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, removeDepartment };