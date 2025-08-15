import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new AdminController();

// Apply auth middleware to all admin routes
router.use(authenticateToken);

// POST /api/admin/import-csv - Import CSV data (ADMIN only)
router.post("/import-csv", controller.importCSVData.bind(controller));

// GET /api/admin/system-status - Get system status (ADMIN only)
router.get("/system-status", controller.getSystemStatus.bind(controller));

export default router;
