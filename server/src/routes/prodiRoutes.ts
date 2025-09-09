import { Router } from "express";
import { ProdiController } from "../controllers/prodiController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new ProdiController();

// GET /api/prodi/search/nama/:nama - Search prodi by name using PDDIKTI API (requires authentication)
router.get(
  "/search/nama/:nama",
  authenticateToken,
  controller.searchProdiByName.bind(controller)
);

// GET /api/prodi/detail/:id - Get prodi detail by PDDIKTI external ID (requires authentication)
router.get(
  "/detail/:id",
  authenticateToken,
  controller.getProdiById.bind(controller)
);

// GET /api/prodi/jenjang - Get list of available jenjang (S1, D3, D4)
// router.get("/jenjang", controller.getJenjangList.bind(controller));

// GET /api/prodi - List prodi with filters using PDDIKTI API
// router.get("/", controller.list.bind(controller));

export default router;
