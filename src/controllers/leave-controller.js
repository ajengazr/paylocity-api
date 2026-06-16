import leaveService from "../services/leave-service.js";

async function createLeave(req, res, next) {
    try {
        const result = await leaveService.create(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            data:    result
        });
    } catch (error) {
        next(error);
    }
}

async function getAllLeaves(req, res, next) {
    try {
        const result = await leaveService.getAll();
        return res.status(200).json({
            success: true,
            data:    result
        });
    } catch (error) {
        next(error);
    }
}

async function getMyLeaves(req, res, next) {
    try {
        const result = await leaveService.getMyLeaves(req.user.id);
        return res.status(200).json({
            success: true,
            data:    result
        });
    } catch (error) {
        next(error);
    }
}

async function getLeaveById(req, res, next) {
    try {
        const leaveId = parseInt(req.params.id);
        const result  = await leaveService.getById(leaveId);
        return res.status(200).json({
            success: true,
            data:    result
        });
    } catch (error) {
        next(error);
    }
}

async function updateLeaveStatus(req, res, next) {
    try {
        const leaveId = parseInt(req.params.id);
        const result  = await leaveService.updateStatus(leaveId, req.body);
        return res.status(200).json({
            success: true,
            data:    result
        });
    } catch (error) {
        next(error);
    }
}

async function removeLeave(req, res, next) {
    try {
        const leaveId = parseInt(req.params.id);
        await leaveService.remove(req.user.id, leaveId);
        return res.status(200).json({
            success: true,
            data:    "Pengajuan cuti berhasil dibatalkan."
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createLeave,
    getAllLeaves,
    getMyLeaves,
    getLeaveById,
    updateLeaveStatus,
    removeLeave
};