import { prismaClient } from "../application/db.js";
import { ResponseError } from "../errors/response.error.js";

// Mendapatkan semua notifikasi milik user tertentu
// Hanya 20 notifikasi terbaru
export async function getMyNotifications(userId) {
    return prismaClient.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

// Menandai satu notifikasi sebagai sudah dibaca
export async function markAsRead(userId, notificationId) {
    const notification = await prismaClient.notification.findFirst({
        where: { 
            id: notificationId, 
            userId 
        }
    });
    
    if (!notification) {
        throw new ResponseError(404, "Notifikasi tidak ditemukan");
    }

    return prismaClient.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
}

// Menandai semua notifikasi user sebagai sudah dibaca
export async function markAllAsRead(userId) {
    return prismaClient.notification.updateMany({
        where: { 
            userId, 
            isRead: false 
        },
        data: { isRead: true }
    });
}

// Mendapatkan jumlah notifikasi yang belum dibaca
export async function getUnreadCount(userId) {
    return prismaClient.notification.count({
        where: { 
            userId, 
            isRead: false 
        }
    });
}

// Menghapus satu notifikasi
export async function deleteNotification(userId, notificationId) {
    const notification = await prismaClient.notification.findFirst({
        where: { id: notificationId, userId }
    });
    
    if (!notification) {
        throw new ResponseError(404, "Notifikasi tidak ditemukan");
    }
    
    return prismaClient.notification.delete({
        where: { id: notificationId }
    });
}

// Menghapus semua notifikasi yang sudah dibaca
export async function deleteReadNotifications(userId) {
    const result = await prismaClient.notification.deleteMany({
        where: { 
            userId, 
            isRead: true 
        }
    });
    
    return { count: result.count };
}

// Membuat notifikasi untuk satu user
export async function createNotification({ userId, title, message, type = 'info', link }) {
    return prismaClient.notification.create({
        data: { 
            userId, 
            title, 
            message, 
            type, 
            link 
        }
    });
}

// Membuat notifikasi untuk semua admin
export async function createNotificationForAdmins({ title, message, type = 'info', link }) {
    const admins = await prismaClient.user.findMany({
        where: {
            role: { in: ['SUPER_ADMIN', 'HR_ADMIN'] }
        },
        select: { id: true }
    });

    const notifications = [];
    for (const admin of admins) {
        const notif = await createNotification({
            userId: admin.id,
            title,
            message,
            type,
            link
        });
        notifications.push(notif);
    }
    
    return notifications;
}