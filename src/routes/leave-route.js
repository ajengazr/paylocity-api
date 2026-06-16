import express from "express";
import leaveController from "../controllers/leave-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const leaveApi = express.Router();

// Employee ajukan cuti
leaveApi.post("/api/leaves",
    authMiddleware,
    authorize("EMPLOYEE"),
    leaveController.createLeave
);

// HR lihat semua pengajuan
leaveApi.get("/api/leaves",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    leaveController.getAllLeaves
);

// Employee lihat pengajuan miliknya
leaveApi.get("/api/leaves/my",
    authMiddleware,
    authorize("EMPLOYEE"),
    leaveController.getMyLeaves
);

// Detail pengajuan
leaveApi.get("/api/leaves/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN", "EMPLOYEE"),
    leaveController.getLeaveById
);

// HR approve atau reject
leaveApi.patch("/api/leaves/:id/status",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    leaveController.updateLeaveStatus
);

// Employee batalkan pengajuan
leaveApi.delete("/api/leaves/:id",
    authMiddleware,
    authorize("EMPLOYEE"),
    leaveController.removeLeave
);