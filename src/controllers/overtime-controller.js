import overtimeService from "../services/overtime-service.js";
import { prismaClient } from "../application/db.js";
import { createNotification } from "../services/notification-service.js";

async function createOvertime(req, res, next) {
    try {
        const result = await overtimeService.create(req.user.id, req.body);

        await createNotification({
            userId: req.user.id,
            title: 'Pengajuan Lembur Terkirim',
            message: `Pengajuan lembur Anda pada ${new Date(req.body.date).toLocaleDateString('id-ID')} telah dikirim dan menunggu persetujuan.`,
            type: 'info'
        });

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function createOvertimeByAdmin(req, res, next) {
    try {
        const result = await overtimeService.createByAdmin(req.body);

        const employee = await prismaClient.employee.findUnique({
            where: { id: result.employeeId },
            select: { userId: true }
        });

        if (employee) {
            await createNotification({
                userId: employee.userId,
                title: 'Lembur Dibuat oleh Admin',
                message: `Admin telah membuat pengajuan lembur untuk Anda pada ${new Date(req.body.date).toLocaleDateString('id-ID')}.`,
                type: 'info'
            });
        }

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function updateOvertimeByAdmin(req, res, next) {
    try {
        const overtimeId = parseInt(req.params.id);
        const result = await overtimeService.updateByAdmin(overtimeId, req.body);

        const overtime = await prismaClient.overtime.findUnique({
            where: { id: overtimeId },
            include: { employee: true }
        });

        if (overtime?.employee) {
            await createNotification({
                userId: overtime.employee.userId,
                title: 'Data Lembur Diperbarui',
                message: `Admin telah memperbarui data lembur Anda.`,
                type: 'info'
            });
        }

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function getAllOvertimes(req, res, next) {
    try {
        const result = await overtimeService.getAll();
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function getMyOvertimes(req, res, next) {
    try {
        const result = await overtimeService.getMyOvertime(req.user.id);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function getOvertimeById(req, res, next) {
    try {
        const overtimeId = parseInt(req.params.id);
        const result = await overtimeService.getById(overtimeId);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function updateOvertimeStatus(req, res, next) {
    try {
        const overtimeId = parseInt(req.params.id);

        const overtime = await prismaClient.overtime.findUnique({
            where: { id: overtimeId },
            include: { employee: { include: { user: true } } }
        });

        const result = await overtimeService.updateStatus(overtimeId, req.body);

        const isApproved = req.body.status === 'APPROVED';
        await createNotification({
            userId: req.user.id,
            title: isApproved ? 'Lembur Disetujui' : 'Lembur Ditolak',
            message: `Anda telah ${isApproved ? 'menyetujui' : 'menolak'} pengajuan lembur ${overtime?.employee?.user?.username || 'Karyawan'}.`,
            type: isApproved ? 'success' : 'info'
        });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

async function removeOvertime(req, res, next) {
    try {
        const overtimeId = parseInt(req.params.id);
        await overtimeService.remove(req.user.id, overtimeId);

        await createNotification({
            userId: req.user.id,
            title: 'Pengajuan Dibatalkan',
            message: 'Anda telah membatalkan pengajuan lembur.',
            type: 'info'
        });

        return res.status(200).json({
            success: true,
            data: "Pengajuan lembur berhasil dibatalkan."
        });
    } catch (error) {
        next(error);
    }
}

export default {
    createOvertime,
    createOvertimeByAdmin,
    updateOvertimeByAdmin,
    getAllOvertimes,
    getMyOvertimes,
    getOvertimeById,
    updateOvertimeStatus,
    removeOvertime
};