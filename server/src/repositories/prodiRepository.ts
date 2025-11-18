import { PrismaClient } from "@prisma/client";

interface CreateProdiDTO {
  prodi_id: number;
  nama_prodi: string;
  jenjang?: string;
}

interface CreateProdiPTDTO {
  prodi_id: number;
  university_id: number;
}

interface ProdiFilters {
  nama_prodi?: string;
  jenjang?: string;
  limit?: number;
  offset?: number;
}

interface ProdiPTFilters {
  prodi_id?: number;
  university_id?: number;
  limit?: number;
  offset?: number;
}

export class ProdiRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  // Create prodi
  async create(data: CreateProdiDTO) {
    return this.prisma.prodi.create({ data });
  }

  // Create many prodi
  async createMany(data: CreateProdiDTO[]) {
    return this.prisma.prodi.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Find by ID
  async findById(prodi_id: number) {
    return this.prisma.prodi.findUnique({
      where: { prodi_id },
      include: {
        prodi_pt: {
          include: {
            universitas: true,
          },
        },
      },
    });
  }

  // Find many with filters
  async findMany(filters: ProdiFilters = {}) {
    const where: any = {};

    if (filters.nama_prodi) {
      where.nama_prodi = {
        contains: filters.nama_prodi,
        mode: "insensitive",
      };
    }

    if (filters.jenjang) {
      where.jenjang = filters.jenjang;
    }

    return this.prisma.prodi.findMany({
      where,
      include: {
        _count: {
          select: {
            prodi_pt: true,
          },
        },
      },
      orderBy: {
        nama_prodi: "asc",
      },
      take: filters.limit || undefined,
      skip: filters.offset || undefined,
    });
  }

  // Search by nama prodi
  async searchByNama(query: string, limit: number = 10) {
    return this.prisma.prodi.findMany({
      where: {
        nama_prodi: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: limit,
      orderBy: {
        nama_prodi: "asc",
      },
    });
  }

  // Find by jenjang
  async findByJenjang(jenjang: string) {
    return this.findMany({ jenjang });
  }

  // Update prodi
  async update(prodi_id: number, data: Partial<CreateProdiDTO>) {
    return this.prisma.prodi.update({
      where: { prodi_id },
      data,
    });
  }

  // Delete prodi
  async delete(prodi_id: number) {
    return this.prisma.prodi.delete({
      where: { prodi_id },
    });
  }

  // Get count
  async count(filters: ProdiFilters = {}) {
    const where: any = {};

    if (filters.nama_prodi) {
      where.nama_prodi = {
        contains: filters.nama_prodi,
        mode: "insensitive",
      };
    }

    if (filters.jenjang) {
      where.jenjang = filters.jenjang;
    }

    return this.prisma.prodi.count({ where });
  }

  // Get all jenjang
  async getAllJenjang() {
    const result = await this.prisma.prodi.findMany({
      select: { jenjang: true },
      where: {
        jenjang: { not: null },
      },
      distinct: ["jenjang"],
      orderBy: { jenjang: "asc" },
    });

    return result
      .map((item) => item.jenjang)
      .filter(Boolean) // Remove null values
      .sort();
  }

  // Check if exists by ID
  async exists(prodi_id: number): Promise<boolean> {
    const count = await this.prisma.prodi.count({
      where: { prodi_id },
    });
    return count > 0;
  }

  // ===== ProdiPT Related Methods =====

  // Create prodi-universitas relation
  async createProdiPT(data: CreateProdiPTDTO) {
    return this.prisma.prodiPT.create({
      data,
      include: {
        prodi: true,
        universitas: true,
      },
    });
  }

  // Create many prodi-universitas relations
  async createManyProdiPT(data: CreateProdiPTDTO[]) {
    return this.prisma.prodiPT.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Find prodi-universitas relations
  async findManyProdiPT(filters: ProdiPTFilters = {}) {
    const where: any = {};

    if (filters.prodi_id) {
      where.prodi_id = filters.prodi_id;
    }

    if (filters.university_id) {
      where.university_id = filters.university_id;
    }

    return this.prisma.prodiPT.findMany({
      where,
      include: {
        prodi: true,
        universitas: true,
      },
      orderBy: [
        { universitas: { nama: "asc" } },
        { prodi: { nama_prodi: "asc" } },
      ],
      take: filters.limit || undefined,
      skip: filters.offset || undefined,
    });
  }

  // Find prodi by university
  async findProdiByUniversity(university_id: number) {
    return this.findManyProdiPT({ university_id });
  }

  // Find universities by prodi
  async findUniversitiesByProdi(prodi_id: number) {
    return this.findManyProdiPT({ prodi_id });
  }

  // Find ProdiPT by ID
  async findProdiPTById(id: number) {
    return this.prisma.prodiPT.findUnique({
      where: { id },
      include: {
        prodi: true,
        universitas: true,
      },
    });
  }

  // Update ProdiPT
  async updateProdiPT(id: number, data: Partial<CreateProdiPTDTO>) {
    return this.prisma.prodiPT.update({
      where: { id },
      data,
      include: {
        prodi: true,
        universitas: true,
      },
    });
  }

  // Delete ProdiPT
  async deleteProdiPT(id: number) {
    return this.prisma.prodiPT.delete({
      where: { id },
    });
  }

  // Check if ProdiPT relation exists
  async prodiPTExists(
    prodi_id: number,
    university_id: number
  ): Promise<boolean> {
    const count = await this.prisma.prodiPT.count({
      where: {
        prodi_id,
        university_id,
      },
    });
    return count > 0;
  }

  // Get ProdiPT count
  async countProdiPT(filters: ProdiPTFilters = {}) {
    const where: any = {};

    if (filters.prodi_id) {
      where.prodi_id = filters.prodi_id;
    }

    if (filters.university_id) {
      where.university_id = filters.university_id;
    }

    return this.prisma.prodiPT.count({ where });
  }
}
