/**
 * RIASEC Assessment Routes
 * Routes for Holland RIASEC career assessment system
 */

import express from "express";
import riasecController from "../controllers/riasecController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/riasec/questions
 * @desc    Get all RIASEC assessment questions
 * @access  Protected (Student only)
 */
router.get("/questions", authenticateToken, riasecController.getQuestions);

/**
 * @route   POST /api/riasec/submit
 * @desc    Submit assessment responses and get career recommendations
 * @access  Protected (Student only)
 */
router.post("/submit", authenticateToken, riasecController.submitAssessment);

/**
 * @route   GET /api/riasec/history
 * @desc    Get user's assessment history
 * @access  Protected (Student only)
 */
router.get(
  "/history",
  authenticateToken,
  riasecController.getAssessmentHistory
);

/**
 * @route   GET /api/riasec/result/:assessmentId
 * @desc    Get detailed assessment result by ID
 * @access  Protected (Student only)
 */
router.get(
  "/result/:assessmentId",
  authenticateToken,
  riasecController.getAssessmentResult
);

export default router;
