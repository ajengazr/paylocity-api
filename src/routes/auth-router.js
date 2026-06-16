import express, { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

export const authApi = express.Router();
authApi.post("/api/users/register",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    userController.userRegister);

authApi.get("/api/users/getAllAdmin",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    userController.getAllAdmin
);

authApi.get("/api/users/:id",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    userController.getUserById);

authApi.put("/api/users/:id",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    userController.updateUser);

authApi.delete("/api/users/:id",
    authMiddleware,
    authorize("SUPER_ADMIN"),
    userController.deleteUser);

authApi.post("/api/users/login", userController.userLogin);

