import express from "express";
import positionController from "../controllers/position-controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const positionApi = express.Router();

// Create - SUPER_ADMIN dan HR_ADMIN
positionApi.post("/api/positions",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    positionController.createPosition
);

// Get All
positionApi.get("/api/positions",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    positionController.getAllPositions
);

// Get By Id
positionApi.get("/api/positions/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    positionController.getPositionById
);

// Get By Department ← endpoint khusus untuk filter by department
// berguna saat form tambah employee (dropdown position menyesuaikan department)
positionApi.get("/api/departments/:departmentId/positions",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    positionController.getPositionsByDepartment
);

// Update - SUPER_ADMIN dan HR_ADMIN
positionApi.put("/api/positions/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    positionController.updatePosition
);

// Delete - hanya SUPER_ADMIN
positionApi.delete("/api/positions/:id",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    positionController.removePosition
);