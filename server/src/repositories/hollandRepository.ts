import { PrismaClient, HollandType } from "@prisma/client";

interface CreateHollandAssessmentDTO {
  user_id: string;
  scores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  primary_type: HollandType;
  secondary_type: HollandType | null;
  tertiary_type: string;
}

export class HollandRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get all Holland questions
  async findAllQuestions() {
    return this.prisma.hollandQuestion.findMany({
      orderBy: { question_id: "asc" },
    });
  }

  // Get all prodi-Holland mappings
  async findAllProdiMappings() {
    return this.prisma.hollandProdiMapping.findMany({
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
  }

  // Create new Holland assessment
  async createAssessment(data: CreateHollandAssessmentDTO) {
    return this.prisma.hollandAssessment.create({
      data: {
        user_id: data.user_id,
        realistic_score: data.scores.realistic,
        investigative_score: data.scores.investigative,
        artistic_score: data.scores.artistic,
        social_score: data.scores.social,
        enterprising_score: data.scores.enterprising,
        conventional_score: data.scores.conventional,
        primary_type: data.primary_type,
        secondary_type: data.secondary_type,
        holland_code: data.tertiary_type,
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
  }

  // Get user's assessment history
  async findAssessmentsByUserId(userId: string, limit: number = 5) {
    return this.prisma.hollandAssessment.findMany({
      where: { user_id: userId },
      orderBy: { completed_at: "desc" },
      take: limit,
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
  }

  // Get user's latest assessment
  async findLatestAssessmentByUserId(userId: string) {
    return this.prisma.hollandAssessment.findFirst({
      where: { user_id: userId },
      orderBy: { completed_at: "desc" },
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
  }
}
