import positionService from "../services/position-service.js";

async function createPosition(req, res, next) {
    try {
        const result = await positionService.create(req.body);
        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllPositions(req, res, next) {
    try {
        const result = await positionService.getAll();
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getPositionById(req, res, next) {
    try {
        const positionId = parseInt(req.params.id);
        const result = await positionService.getById(positionId);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getPositionsByDepartment(req, res, next) {
    try {
        const departmentId = parseInt(req.params.departmentId);
        const result = await positionService.getByDepartment(departmentId);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updatePosition(req, res, next) {
    try {
        const positionId = parseInt(req.params.id);
        const result = await positionService.update(positionId, req.body);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function removePosition(req, res, next) {
    try {
        const positionId = parseInt(req.params.id);
        await positionService.remove(positionId);
        return res.status(200).json({
            success: true,
            data: "Jabatan berhasil dihapus."
        });
    } catch (error) {
        next(error);
    }
}

export default { createPosition, getAllPositions, getPositionById, getPositionsByDepartment, updatePosition, removePosition };