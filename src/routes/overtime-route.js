import express from "express";
import overtimeController from "../controllers/overtime-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const overtimeApi = express.Router();

// Employee ajukan lembur sendiri → PENDING
overtimeApi.post("/api/overtimes",
    authMiddleware,
    authorize("EMPLOYEE"),
    overtimeController.createOvertime
);

// Admin tambah lembur untuk employee → langsung APPROVED
overtimeApi.post("/api/overtimes/admin",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    overtimeController.createOvertimeByAdmin
);

// HR Admin lihat semua pengajuan
overtimeApi.get("/api/overtimes",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    overtimeController.getAllOvertimes
);

// Employee lihat lembur miliknya sendiri
overtimeApi.get("/api/overtimes/my",
    authMiddleware,
    authorize("EMPLOYEE"),
    overtimeController.getMyOvertimes
);

// Detail lembur
overtimeApi.get("/api/overtimes/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN", "EMPLOYEE"),
    overtimeController.getOvertimeById
);

// HR Admin approve atau reject pengajuan employee
overtimeApi.patch("/api/overtimes/:id/status",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    overtimeController.updateOvertimeStatus
);

// Admin edit data lembur (selama belum masuk payroll)
overtimeApi.put("/api/overtimes/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    overtimeController.updateOvertimeByAdmin
);

// Employee batalkan pengajuan (hanya PENDING)
overtimeApi.delete("/api/overtimes/:id",
    authMiddleware,
    authorize("EMPLOYEE", "SUPER_ADMIN"),
    overtimeController.removeOvertime
);