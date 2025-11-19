import { Router } from "express";
import { ZoomController } from "../controllers/zoomController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const zoomController = new ZoomController();

// Create Zoom meeting
router.post(
  "/create-meeting",
  authenticateToken,
  zoomController.createZoomMeeting.bind(zoomController)
);

// Get Zoom meetings for a consultation
router.get(
  "/meetings/:consultationId",
  authenticateToken,
  zoomController.getZoomMeetings.bind(zoomController)
);

// Delete Zoom meeting
router.delete(
  "/meeting/:meetingId",
  authenticateToken,
  zoomController.deleteZoomMeeting.bind(zoomController)
);

export default router;
