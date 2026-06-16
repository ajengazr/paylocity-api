import * as notificationService from "../services/notification-service.js";

export async function getMyNotifications(req, res, next) {
    try {
        const result = await notificationService.getMyNotifications(req.user.id);
        res.status(200).json({ 
            success: true, 
            data: result 
        });
    } catch (error) {
        next(error);
    }
}

export async function markAsRead(req, res, next) {
    try {
        const { id } = req.params;
        const notificationId = parseInt(id);
        
        if (isNaN(notificationId) || notificationId <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "ID notifikasi tidak valid" 
            });
        }
        
        await notificationService.markAsRead(req.user.id, notificationId);
        
        res.status(200).json({ 
            success: true, 
            message: "Notifikasi ditandai sebagai sudah dibaca" 
        });
    } catch (error) {
        next(error);
    }
}

export async function markAllAsRead(req, res, next) {
    try {
        await notificationService.markAllAsRead(req.user.id);
        
        res.status(200).json({ 
            success: true, 
            message: "Semua notifikasi ditandai sebagai sudah dibaca" 
        });
    } catch (error) {
        next(error);
    }
}

export async function getUnreadCount(req, res, next) {
    try {
        const result = await notificationService.getUnreadCount(req.user.id);
        res.status(200).json({ 
            success: true, 
            data: { unreadCount: result } 
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteNotification(req, res, next) {
    try {
        const { id } = req.params;
        const notificationId = parseInt(id);
        
        if (isNaN(notificationId) || notificationId <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "ID notifikasi tidak valid" 
            });
        }
        
        await notificationService.deleteNotification(req.user.id, notificationId);
        
        res.status(200).json({ 
            success: true, 
            message: "Notifikasi berhasil dihapus" 
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteReadNotifications(req, res, next) {
    try {
        const result = await notificationService.deleteReadNotifications(req.user.id);
        
        res.status(200).json({ 
            success: true, 
            message: `${result.count} notifikasi yang sudah dibaca berhasil dihapus`,
            data: { deletedCount: result.count }
        });
    } catch (error) {
        next(error);
    }
}