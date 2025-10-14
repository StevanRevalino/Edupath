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

// Get students with accepted consultations for live chat
router.get(
  "/accepted-students",
  authenticateToken,
  consultationController.getStudentsWithAcceptedConsultations.bind(
    consultationController
  )
);

// Get consultation statistics (for admin dashboard)
router.get(
  "/stats",
  authenticateToken,
  consultationController.getConsultationStats.bind(consultationController)
);

// Get booked slots for a specific date
router.get(
  "/booked-slots",
  authenticateToken,
  consultationController.getBookedSlotsForDate.bind(consultationController)
);

// Auto-complete expired consultations
router.post(
  "/auto-complete",
  authenticateToken,
  consultationController.autoCompleteExpiredConsultations.bind(
    consultationController
  )
);

// Get consultations by status
router.get(
  "/status/:status",
  authenticateToken,
  consultationController.getConsultationsByStatus.bind(consultationController)
);

// Get consultations by student name
router.get(
  "/student/name/:firstname",
  authenticateToken,
  consultationController.getConsultationsForStudentByName.bind(
    consultationController
  )
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

// Cancel consultation (by student)
router.patch(
  "/:id/cancel",
  authenticateToken,
  consultationController.cancelConsultation.bind(consultationController)
);

// End consultation (set is_active to false)
router.patch(
  "/:id/end",
  authenticateToken,
  consultationController.endConsultation.bind(consultationController)
);

// Delete consultation
router.delete(
  "/:id",
  authenticateToken,
  consultationController.deleteConsultation.bind(consultationController)
);

export default router;
