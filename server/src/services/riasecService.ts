/**
 * RIASEC Assessment Service
 * Implements Fuzzy Logic for Holland's RIASEC theory
 */

import prisma from "../configs/prisma";
import { fuzzyLogicService } from "./fuzzyLogic";

// Types for RIASEC assessment
type RiasecType =
  | "REALISTIC"
  | "INVESTIGATIVE"
  | "ARTISTIC"
  | "SOCIAL"
  | "ENTERPRISING"
  | "CONVENTIONAL";

interface RiasecScores {
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

interface AssessmentResult {
  assessment_id: string;
  scores: RiasecScores;
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
  tertiary_type: RiasecType | null;
  holland_code: string;
  recommendations: RecommendationResult[];
}

interface RecommendationResult {
  prodi_id: number;
  nama_prodi: string;
  jenjang: string | null;
  match_percentage: number;
  rank: number;
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
}

class RiasecService {
  /**
   * Get all RIASEC questions for assessment
   */
  async getQuestions() {
    const questions = await prisma.riasecQuestion.findMany({
      orderBy: {
        question_id: "asc",
      },
    });

    return questions;
  }

  /**
   * Calculate RIASEC scores from user responses
   */
  private calculateScores(
    responses: AssessmentResponse[],
    questions: any[]
  ): RiasecScores {
    const scores: RiasecScores = {
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

      const type = question.riasec_type.toLowerCase();
      if (type in scores) {
        scores[type as keyof RiasecScores] += response.answer_value;
      }
    }

    return scores;
  }

  /**
   * Get Holland Code (3-letter code representing top 3 types)
   */
  private getHollandCode(scores: RiasecScores): {
    code: string;
    primary: RiasecType;
    secondary: RiasecType | null;
    tertiary: RiasecType | null;
  } {
    const typeMapping: { [key: string]: RiasecType } = {
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
  private calculateMatchPercentage(
    prodiPrimary: RiasecType,
    prodiSecondary: RiasecType | null,
    scores: RiasecScores
  ): number {
    // Convert RiasecScores to UserRiasecScores format
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
   * Get program study recommendations based on RIASEC scores
   * Uses Fuzzy Logic for match calculation
   */
  private async getRecommendations(
    scores: RiasecScores
  ): Promise<RecommendationResult[]> {
    // Get all prodi mappings
    const mappings = await prisma.riasecProdiMapping.findMany({
      include: {
        prodi: {
          include: {
            prodi_pt: {
              select: {
                university_id: true,
              },
            },
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
   * Submit assessment and calculate results
   */
  async submitAssessment(
    userId: string,
    responses: AssessmentResponse[]
  ): Promise<AssessmentResult> {
    // Validate responses (should have 60 answers)
    if (responses.length !== 60) {
      throw new Error("Assessment must have exactly 60 responses");
    }

    // Validate answer values (1-5)
    for (const response of responses) {
      if (response.answer_value < 1 || response.answer_value > 5) {
        throw new Error("Answer values must be between 1 and 5");
      }
    }

    // Get all questions
    const questions = await this.getQuestions();

    // Calculate scores
    const scores = this.calculateScores(responses, questions);

    // Get Holland code
    const { code, primary, secondary, tertiary } = this.getHollandCode(scores);

    // Get recommendations using Fuzzy Logic
    const recommendations = await this.getRecommendations(scores);

    // Save assessment to database
    const assessment = await prisma.riasecAssessment.create({
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
        responses: {
          create: responses.map((r) => ({
            question_id: r.question_id,
            answer_value: r.answer_value,
          })),
        },
        recommendations: {
          create: recommendations.map((r) => ({
            prodi_id: r.prodi_id,
            match_percentage: r.match_percentage,
            rank: r.rank,
          })),
        },
      },
      include: {
        responses: true,
        recommendations: {
          include: {
            prodi: true,
          },
        },
      },
    });

    return {
      assessment_id: assessment.assessment_id,
      scores,
      primary_type: primary,
      secondary_type: secondary,
      tertiary_type: tertiary,
      holland_code: code,
      recommendations,
    };
  }

  /**
   * Get assessment history for a user
   */
  async getUserAssessments(userId: string) {
    const assessments = await prisma.riasecAssessment.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        completed_at: "desc",
      },
      select: {
        assessment_id: true,
        primary_type: true,
        secondary_type: true,
        holland_code: true,
        completed_at: true,
      },
    });

    return assessments;
  }

  /**
   * Get detailed assessment result by ID
   */
  async getAssessmentById(assessmentId: string, userId: string) {
    const assessment = await prisma.riasecAssessment.findFirst({
      where: {
        assessment_id: assessmentId,
        user_id: userId,
      },
      include: {
        recommendations: {
          include: {
            prodi: {
              include: {
                prodi_pt: {
                  select: {
                    university_id: true,
                  },
                },
                riasecMappings: {
                  select: {
                    primary_type: true,
                    secondary_type: true,
                  },
                },
              },
            },
          },
          orderBy: {
            rank: "asc",
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const scores: RiasecScores = {
      realistic: assessment.realistic_score,
      investigative: assessment.investigative_score,
      artistic: assessment.artistic_score,
      social: assessment.social_score,
      enterprising: assessment.enterprising_score,
      conventional: assessment.conventional_score,
    };

    const { tertiary } = this.getHollandCode(scores);

    return {
      assessment_id: assessment.assessment_id,
      scores,
      primary_type: assessment.primary_type,
      secondary_type: assessment.secondary_type,
      tertiary_type: tertiary,
      holland_code: assessment.holland_code,
      completed_at: assessment.completed_at,
      recommendations: assessment.recommendations.map((rec: any) => {
        // Get the first mapping (should be the most relevant)
        const mapping = rec.prodi.riasecMappings?.[0];

        return {
          prodi_id: rec.prodi.prodi_id,
          nama_prodi: rec.prodi.nama_prodi,
          jenjang: rec.prodi.jenjang,
          match_percentage: rec.match_percentage,
          rank: rec.rank,
          primary_type: mapping?.primary_type || assessment.primary_type,
          secondary_type: mapping?.secondary_type || assessment.secondary_type,
        };
      }),
    };
  }
}

export default new RiasecService();
