/**
 * Holland Assessment Service
 * Implements Fuzzy Logic for Holland's Career Theory
 */

import { HollandRepository } from "../repositories/hollandRepository";
import { fuzzyLogicService } from "./fuzzyLogic";

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

interface AssessmentResult {
  assessment_id: string;
  scores: HollandScores;
  primary_type: HollandType;
  secondary_type: HollandType | null;
  tertiary_type: HollandType | null;
  holland_code: string;
  recommendations: RecommendationResult[];
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

class HollandService {
  private hollandRepository: HollandRepository;

  constructor() {
    this.hollandRepository = new HollandRepository();
  }

  /**
   * Get all Holland questions for assessment
   */
  async getQuestions() {
    return this.hollandRepository.findAllQuestions();
  }

  /**
   * Calculate Holland scores from user responses
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
   * Get Holland Code (3-letter code representing top 3 types)
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
   * Get program study recommendations based on Holland scores
   * Uses Fuzzy Logic for match calculation
   */
  private async getRecommendations(
    scores: HollandScores
  ): Promise<RecommendationResult[]> {
    // Get all prodi mappings
    const mappings = await this.hollandRepository.findAllProdiMappings();

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
    const assessment = await this.hollandRepository.createAssessment({
      user_id: userId,
      scores,
      primary_type: primary,
      secondary_type: secondary,
      tertiary_type: code,
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
    const assessments = await this.hollandRepository.findAssessmentsByUserId(
      userId,
      100
    );

    return assessments.map((assessment: any) => ({
      assessment_id: assessment.assessment_id,
      primary_type: assessment.primary_type,
      secondary_type: assessment.secondary_type,
      holland_code: assessment.holland_code,
      completed_at: assessment.completed_at,
    }));
  }

  /**
   * Get detailed assessment result by ID
   */
  async getAssessmentById(assessmentId: string, userId: string) {
    const assessment = await this.hollandRepository.findAssessmentById(
      assessmentId
    );

    if (!assessment || assessment.user_id !== userId) {
      throw new Error("Assessment not found");
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

    return {
      assessment_id: assessment.assessment_id,
      scores,
      primary_type: assessment.primary_type,
      secondary_type: assessment.secondary_type,
      tertiary_type: tertiary,
      holland_code: assessment.holland_code,
      completed_at: assessment.completed_at,
      recommendations: recommendations.slice(0, 10), // Return top 10
    };
  }
}

export default new HollandService();
