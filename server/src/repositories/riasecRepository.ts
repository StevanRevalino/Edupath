import { PrismaClient, RiasecType } from "@prisma/client";

interface CreateRiasecAssessmentDTO {
  user_id: string;
  scores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
  tertiary_type: string;
}

export class RiasecRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get all RIASEC questions
  async findAllQuestions() {
    return this.prisma.riasecQuestion.findMany({
      orderBy: { question_id: "asc" },
    });
  }

  // Get all prodi-RIASEC mappings
  async findAllProdiMappings() {
    return this.prisma.riasecProdiMapping.findMany({
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

  // Create new RIASEC assessment
  async createAssessment(data: CreateRiasecAssessmentDTO) {
    return this.prisma.riasecAssessment.create({
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
    return this.prisma.riasecAssessment.findMany({
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
    return this.prisma.riasecAssessment.findFirst({
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
