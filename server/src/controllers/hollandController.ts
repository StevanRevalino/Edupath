/**
 * Holland Assessment Controller
 * Handles HTTP requests for Holland career assessment
 */

import { Request, Response } from "express";
import prisma from "../configs/prisma";
import { fuzzyLogicService } from "../services/fuzzyLogic";

// Types for Holland assessment
type HollandType =
  | "REALISTIC"
  | "INVESTIGATIVE"
  | "ARTISTIC"
  | "SOCIAL"
  | "ENTERPRISING"
  | "CONVENTIONAL";

interface HollandScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

interface AssessmentResponse {
  question_id: number;
  answer_value: number; // 1-5 Likert scale
}

interface RecommendationResult {
  prodi_id: number;
  nama_prodi: string;
  jenjang: string | null;
  match_percentage: number;
  rank: number;
  primary_type: HollandType;
  secondary_type: HollandType | null;
}

class HollandController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getQuestions = this.getQuestions.bind(this);
    this.submitAssessment = this.submitAssessment.bind(this);
    this.getAssessmentHistory = this.getAssessmentHistory.bind(this);
    this.getAssessmentResult = this.getAssessmentResult.bind(this);
  }

  /**
   * GET /api/holland/questions
   * Get all assessment questions
   */
  async getQuestions(req: Request, res: Response) {
    try {
      const questions = await prisma.hollandQuestion.findMany({
        orderBy: { question_id: "asc" },
      });

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
   * Helper: Calculate Holland scores from user responses
   */
  private calculateScores(
    responses: AssessmentResponse[],
    questions: any[]
  ): HollandScores {
    const scores: HollandScores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };

    // Create a map for quick question lookup
    const questionMap = new Map(questions.map((q) => [q.question_id, q]));

    // Calculate raw scores for each type
    for (const response of responses) {
      const question = questionMap.get(response.question_id);
      if (!question) continue;

      const type = question.holland_type.toLowerCase();
      if (type in scores) {
        scores[type as keyof HollandScores] += response.answer_value;
      }
    }

    return scores;
  }

  /**
   * Helper: Get Holland Code (3-letter code representing top 3 types)
   */
  private getHollandCode(scores: HollandScores): {
    code: string;
    primary: HollandType;
    secondary: HollandType | null;
    tertiary: HollandType | null;
  } {
    const typeMapping: { [key: string]: HollandType } = {
      realistic: "REALISTIC",
      investigative: "INVESTIGATIVE",
      artistic: "ARTISTIC",
      social: "SOCIAL",
      enterprising: "ENTERPRISING",
      conventional: "CONVENTIONAL",
    };

    const sortedTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const code = sortedTypes.map(([type]) => type[0].toUpperCase()).join("");

    return {
      code,
      primary: typeMapping[sortedTypes[0][0]],
      secondary: sortedTypes[1] ? typeMapping[sortedTypes[1][0]] : null,
      tertiary: sortedTypes[2] ? typeMapping[sortedTypes[2][0]] : null,
    };
  }

  /**
   * Helper: Calculate match percentage using Fuzzy Logic
   */
  private calculateMatchPercentage(
    prodiPrimary: HollandType,
    prodiSecondary: HollandType | null,
    scores: HollandScores
  ): number {
    // Convert HollandScores to UserHollandScores format
    const userScores = {
      R: scores.realistic,
      I: scores.investigative,
      A: scores.artistic,
      S: scores.social,
      E: scores.enterprising,
      C: scores.conventional,
    };

    // Use Fuzzy Logic to calculate match percentage
    return fuzzyLogicService.calculateMatchPercentage(
      userScores,
      prodiPrimary,
      prodiSecondary
    );
  }

  /**
   * Helper: Get program study recommendations based on Holland scores
   * Uses Fuzzy Logic for match calculation
   */
  private async getRecommendations(
    scores: HollandScores
  ): Promise<RecommendationResult[]> {
    // Get all prodi mappings
    const mappings = await prisma.hollandProdiMapping.findMany({
      include: {
        prodi: {
          select: {
            prodi_id: true,
            nama_prodi: true,
            jenjang: true,
          },
        },
      },
    });

    // If no mappings found, return empty array
    if (mappings.length === 0) {
      return [];
    }

    // Calculate match percentage for each prodi using Fuzzy Logic
    const recommendations = mappings.map((mapping: any) => {
      const matchPercentage = this.calculateMatchPercentage(
        mapping.primary_type,
        mapping.secondary_type,
        scores
      );

      return {
        prodi_id: mapping.prodi.prodi_id,
        nama_prodi: mapping.prodi.nama_prodi,
        jenjang: mapping.prodi.jenjang,
        match_percentage: matchPercentage,
        rank: 0, // Will be set after sorting
        primary_type: mapping.primary_type,
        secondary_type: mapping.secondary_type,
      };
    });

    // Sort by match percentage and set rank
    recommendations.sort(
      (a: any, b: any) => b.match_percentage - a.match_percentage
    );
    recommendations.forEach((rec: any, index: number) => {
      rec.rank = index + 1;
    });

    // Return top 20 recommendations
    return recommendations.slice(0, 20);
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

      // Validate responses (should have 60 answers)
      if (responses.length !== 60) {
        return res.status(400).json({
          success: false,
          message: "Assessment must have exactly 60 responses",
        });
      }

      // Validate answer values (1-5)
      for (const response of responses) {
        if (response.answer_value < 1 || response.answer_value > 5) {
          return res.status(400).json({
            success: false,
            message: "Answer values must be between 1 and 5",
          });
        }
      }

      // Get all questions
      const questions = await prisma.hollandQuestion.findMany({
        orderBy: { question_id: "asc" },
      });

      // Calculate scores
      const scores = this.calculateScores(responses, questions);

      // Get Holland code
      const { code, primary, secondary, tertiary } =
        this.getHollandCode(scores);

      // Get recommendations using Fuzzy Logic
      const recommendations = await this.getRecommendations(scores);

      // Save assessment to database
      const assessment = await prisma.hollandAssessment.create({
        data: {
          user_id: userId,
          realistic_score: scores.realistic,
          investigative_score: scores.investigative,
          artistic_score: scores.artistic,
          social_score: scores.social,
          enterprising_score: scores.enterprising,
          conventional_score: scores.conventional,
          primary_type: primary,
          secondary_type: secondary,
          holland_code: code,
        },
        include: {
          user: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
      });

      const result = {
        assessment_id: assessment.assessment_id,
        scores,
        primary_type: primary,
        secondary_type: secondary,
        tertiary_type: tertiary,
        holland_code: code,
        recommendations,
      };

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

      const assessments = await prisma.hollandAssessment.findMany({
        where: { user_id: userId },
        orderBy: { completed_at: "desc" },
        take: 100,
        include: {
          user: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
            },
          },
        },
      });

      const formattedAssessments = assessments.map((assessment: any) => ({
        assessment_id: assessment.assessment_id,
        primary_type: assessment.primary_type,
        secondary_type: assessment.secondary_type,
        holland_code: assessment.holland_code,
        completed_at: assessment.completed_at,
      }));

      res.status(200).json({
        success: true,
        data: formattedAssessments,
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

      const assessment = await prisma.hollandAssessment.findUnique({
        where: { assessment_id: assessmentId },
        include: {
          user: {
            select: {
              user_id: true,
              firstname: true,
              lastname: true,
              email: true,
            },
          },
        },
      });

      if (!assessment || assessment.user_id !== userId) {
        return res.status(404).json({
          success: false,
          message: "Assessment not found",
        });
      }

      const scores: HollandScores = {
        realistic: assessment.realistic_score,
        investigative: assessment.investigative_score,
        artistic: assessment.artistic_score,
        social: assessment.social_score,
        enterprising: assessment.enterprising_score,
        conventional: assessment.conventional_score,
      };

      const { tertiary } = this.getHollandCode(scores);

      // Get recommendations from mappings
      const recommendations = await this.getRecommendations(scores);

      const result = {
        assessment_id: assessment.assessment_id,
        scores,
        primary_type: assessment.primary_type,
        secondary_type: assessment.secondary_type,
        tertiary_type: tertiary,
        holland_code: assessment.holland_code,
        completed_at: assessment.completed_at,
        recommendations: recommendations.slice(0, 10), // Return top 10
      };

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
