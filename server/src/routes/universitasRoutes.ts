import { Router } from "express";
import { UniversitasController } from "../controllers/universitasController";

const router = Router();
const universitasController = new UniversitasController();

// GET /api/universitas/search - Search universitas by name
router.get(
  "/search",
  universitasController.searchUniversitas.bind(universitasController)
);

// GET /api/universitas/:id - Get universitas by ID
router.get(
  "/:id",
  universitasController.getUniversitasById.bind(universitasController)
);

export default router;
