import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import departementController from "../controllers/departement-controller.js";

export const departmentApi = express.Router();

// Create - hanya SUPER_ADMIN dan HR_ADMIN
departmentApi.post("/api/departments",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    departementController.createDepartment
);

departmentApi.get("/api/departments",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    departementController.getAllDepartments
);

// Get By Id
departmentApi.get("/api/departments/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    departementController.getDepartmentById
);

// Update - hanya SUPER_ADMIN dan HR_ADMIN
departmentApi.put("/api/departments/:id",
    authMiddleware,
    authorize("SUPER_ADMIN", "HR_ADMIN"),
    departementController.updateDepartment
);

// Delete - hanya SUPER_ADMIN
departmentApi.delete("/api/departments/:id",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    departementController.removeDepartment
);