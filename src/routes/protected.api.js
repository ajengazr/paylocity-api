import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import userController from "../controllers/user.controller.js";  

const protectedApi = express.Router();
protectedApi.use(authMiddleware);
protectedApi.get('/api/user', userController.getAllAdmin);
protectedApi.get('/api/user/logout', userController.userLogout);

export { protectedApi };