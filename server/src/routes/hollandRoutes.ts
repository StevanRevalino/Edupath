/**
 * Holland Assessment Routes
 * Routes for Holland career assessment system
 */

import express from "express";
import hollandController from "../controllers/hollandController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/holland/questions
 * @desc    Get all Holland assessment questions
 * @access  Protected (Student only)
 */
router.get("/questions", authenticateToken, hollandController.getQuestions);

/**
 * @route   POST /api/holland/submit
 * @desc    Submit assessment responses and get career recommendations
 * @access  Protected (Student only)
 */
router.post("/submit", authenticateToken, hollandController.submitAssessment);

/**
 * @route   GET /api/holland/history
 * @desc    Get user's assessment history
 * @access  Protected (Student only)
 */
router.get(
  "/history",
  authenticateToken,
  hollandController.getAssessmentHistory
);

/**
 * @route   GET /api/holland/result/:assessmentId
 * @desc    Get detailed assessment result by ID
 * @access  Protected (Student only)
 */
router.get(
  "/result/:assessmentId",
  authenticateToken,
  hollandController.getAssessmentResult
);

export default router;
