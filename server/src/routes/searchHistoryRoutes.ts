import { Router } from "express";
import { SearchHistoryController } from "../controllers/searchHistoryController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const controller = new SearchHistoryController();

// POST /api/search-history - Save search query (requires authentication)
router.post("/", authenticateToken, controller.saveSearch.bind(controller));

// GET /api/search-history/recent - Get recent searches (requires authentication)
router.get(
  "/recent",
  authenticateToken,
  controller.getRecentSearches.bind(controller)
);

// DELETE /api/search-history - Clear search history (requires authentication)
router.delete("/", authenticateToken, controller.clearHistory.bind(controller));

export default router;
