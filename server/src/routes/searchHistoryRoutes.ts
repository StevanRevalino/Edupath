import { Router } from "express";
import { SearchHistoryController } from "../controllers/searchHistoryController";

const router = Router();
const controller = new SearchHistoryController();

// POST /api/search-history - Save search query
router.post("/", controller.saveSearch.bind(controller));

// GET /api/search-history/recent - Get recent searches
router.get("/recent", controller.getRecentSearches.bind(controller));

// DELETE /api/search-history - Clear search history
router.delete("/", controller.clearHistory.bind(controller));

export default router;
