import { Router } from "express";
import { ProdiController } from "../controllers/prodiController";

const router = Router();
const controller = new ProdiController();

// GET /api/prodi
router.get("/", controller.list.bind(controller));

// GET /api/prodi/jenjang
router.get("/jenjang", controller.getJenjangList.bind(controller));

// GET /api/prodi/:id
router.get("/:id", controller.getById.bind(controller));

// GET /api/prodi/:id/universitas
router.get("/:id/universitas", controller.getUniversitas.bind(controller));

export default router;
