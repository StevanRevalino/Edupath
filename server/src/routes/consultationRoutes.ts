import express from "express";
import { ConsultationController } from "../controllers/consultationController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();
const consultationController = new ConsultationController();

// Create a new consultation
router.post(
  "/",
  authenticateToken,
  consultationController.createConsultation.bind(consultationController)
);

// Get all consultations with optional filters
router.get(
  "/",
  authenticateToken,
  consultationController.getAllConsultations.bind(consultationController)
);

// Get consultation statistics (for admin dashboard)
router.get(
  "/stats",
  authenticateToken,
  consultationController.getConsultationStats.bind(consultationController)
);

// Get consultations by status
router.get(
  "/status/:status",
  authenticateToken,
  consultationController.getConsultationsByStatus.bind(consultationController)
);

// Get consultations for a specific student
router.get(
  "/student/:student_id",
  authenticateToken,
  consultationController.getConsultationsForStudent.bind(consultationController)
);

// Get consultations for a specific admin
router.get(
  "/admin/:admin_id",
  authenticateToken,
  consultationController.getConsultationsForAdmin.bind(consultationController)
);

// Get consultation by ID
router.get(
  "/:id",
  authenticateToken,
  consultationController.getConsultationById.bind(consultationController)
);

// Update consultation status (accept/decline)
router.patch(
  "/:id/status",
  authenticateToken,
  consultationController.updateConsultationStatus.bind(consultationController)
);

// Delete consultation
router.delete(
  "/:id",
  authenticateToken,
  consultationController.deleteConsultation.bind(consultationController)
);

export default router;
