import { Router } from "express";
import { UniversitasController } from "../controllers/universitasController";

const router = Router();
const universitasController = new UniversitasController();

// GET /api/universitas - Get all universitas
router.get(
  "/",
  universitasController.getAllUniversitas.bind(universitasController)
);

// GET /api/universitas/filter/provinsi - Get universitas by provinsi
router.get(
  "/filter/provinsi",
  universitasController.getUniversitasByProvinsi.bind(universitasController)
);

// GET /api/universitas/filter/akreditasi - Get universitas by akreditasi
router.get(
  "/filter/akreditasi",
  universitasController.getUniversitasByAkreditasi.bind(universitasController)
);

// GET /api/universitas/search/nama - Search universitas by name
router.get(
  "/search/nama",
  universitasController.searchUniversitas.bind(universitasController)
);

// GET /api/universitas/list/provinsi - Get list of provinsi
router.get(
  "/list/provinsi",
  universitasController.getProvinsiList.bind(universitasController)
);

// GET /api/universitas/list/akreditasi - Get list of akreditasi
router.get(
  "/list/akreditasi",
  universitasController.getAkreditasiList.bind(universitasController)
);

// GET /api/universitas/:id - Get universitas by ID
router.get(
  "/:id",
  universitasController.getUniversitasById.bind(universitasController)
);

// GET /api/universitas/:id/prodi - Get prodi offered by the university
router.get(
  "/:id/prodi",
  universitasController.getProdiByUniversitas.bind(universitasController)
);

export default router;
