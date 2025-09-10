import express from "express";
import { userController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

// Apply auth middleware to all user routes
router.use(authenticateToken);

// User routes
router.get("/", userController.getAllUsers); // GET /api/users
router.get("/:id", userController.getUserById); // GET /api/users/:id
router.put("/:id", userController.updateUser); // PUT /api/users/:id
router.delete("/:id", userController.deleteUser); // DELETE /api/users/:id

export default router;
