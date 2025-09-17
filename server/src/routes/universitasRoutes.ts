import { Router } from "express";
import { UniversitasController } from "../controllers/universitasController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const universitasController = new UniversitasController();

// GET /api/universitas/search - Search universitas by name (requires authentication)
router.get(
  "/search",
  authenticateToken,
  universitasController.searchUniversitas.bind(universitasController)
);

// GET /api/universitas/:id - Get universitas by ID (requires authentication)
router.get(
  "/:id",
  authenticateToken,
  universitasController.getUniversitasById.bind(universitasController)
);

export default router;
