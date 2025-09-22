import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const chatController = new ChatController();

// Get chat users (students with accepted consultations)
router.get(
  "/users",
  authenticateToken,
  chatController.getChatUsers.bind(chatController)
);

// Get or create chat room for a consultation
router.get(
  "/room/:consultationId",
  authenticateToken,
  chatController.getChatRoom.bind(chatController)
);

// Get messages for a chat room
router.get(
  "/messages/:roomId",
  authenticateToken,
  chatController.getChatMessages.bind(chatController)
);

// Send a message to a chat room
router.post(
  "/messages/:roomId",
  authenticateToken,
  chatController.sendMessage.bind(chatController)
);

// Get chat rooms for admin
router.get(
  "/rooms",
  authenticateToken,
  chatController.getAdminChatRooms.bind(chatController)
);

export default router;
