import express from "express";
import { UserController } from "../controllers/userController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();
const userController = new UserController();

// Apply auth middleware to all user routes
router.use(authenticateToken);

// User routes
router.get("/", userController.getAllUsers.bind(userController)); // GET /api/users
router.get("/:id", userController.getUserById.bind(userController)); // GET /api/users/:id
router.put("/:id", userController.updateUser.bind(userController)); // PUT /api/users/:id
router.delete("/:id", userController.deleteUser.bind(userController)); // DELETE /api/users/:id

export default router;
