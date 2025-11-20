/**
 * Holland Assessment Controller
 * Handles HTTP requests for Holland career assessment
 */

import { Request, Response } from "express";
import hollandService from "../services/hollandService";

class HollandController {
  /**
   * GET /api/holland/questions
   * Get all assessment questions
   */
  async getQuestions(req: Request, res: Response) {
    try {
      const questions = await hollandService.getQuestions();

      res.status(200).json({
        success: true,
        data: questions,
        message: "Questions retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve questions",
      });
    }
  }

  /**
   * POST /api/holland/submit
   * Submit assessment responses and get recommendations
   */
  async submitAssessment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id;
      const { responses } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (!responses || !Array.isArray(responses)) {
        return res.status(400).json({
          success: false,
          message: "Responses must be an array",
        });
      }

      const result = await hollandService.submitAssessment(userId, responses);

      res.status(201).json({
        success: true,
        data: result,
        message: "Assessment submitted successfully",
      });
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to submit assessment",
      });
    }
  }

  /**
   * GET /api/holland/history
   * Get user's assessment history
   */
  async getAssessmentHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const assessments = await hollandService.getUserAssessments(userId);

      res.status(200).json({
        success: true,
        data: assessments,
        message: "Assessment history retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error fetching assessment history:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve assessment history",
      });
    }
  }

  /**
   * GET /api/holland/result/:assessmentId
   * Get detailed assessment result
   */
  async getAssessmentResult(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id;
      const { assessmentId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      if (!assessmentId) {
        return res.status(400).json({
          success: false,
          message: "Assessment ID is required",
        });
      }

      const result = await hollandService.getAssessmentById(
        assessmentId,
        userId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Assessment result retrieved successfully",
      });
    } catch (error: any) {
      console.error("Error fetching assessment result:", error);
      if (error.message === "Assessment not found") {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve assessment result",
      });
    }
  }
}

export default new HollandController();
