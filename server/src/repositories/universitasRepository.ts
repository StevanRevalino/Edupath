import prisma from "../configs/prisma";

interface CreateUniversitasDTO {
  university_id: number;
  nama: string;
  npsn?: string;
  nama_singkat?: string;
  kode_pos?: string;
  telepon?: string;
  fax?: string;
  email?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  akreditasi?: string;
  status?: string;
  rank_qs?: string;
  rank_country?: string;
}

interface UniversitasFilters {
  nama?: string;
  kota?: string;
  provinsi?: string;
  akreditasi?: string;
  limit?: number;
  offset?: number;
}

export class UniversitasRepository {
  constructor() {
    // Using singleton prisma instance
  }
  // Create universitas
  async create(data: CreateUniversitasDTO) {
    return prisma.universitas.create({ data });
  }

  // Create many universitas
  async createMany(data: CreateUniversitasDTO[]) {
    return prisma.universitas.createMany({
      data,
      skipDuplicates: true,
    });
  }

  // Find by ID
  async findById(university_id: number) {
    return prisma.universitas.findUnique({
      where: { university_id },
      include: {
        prodi_pt: {
          include: {
            prodi: true,
          },
        },
      },
    });
  }

  // Find many with filters
  async findMany(filters: UniversitasFilters = {}) {
    const where: any = {};

    if (filters.nama) {
      where.nama = {
        contains: filters.nama,
        mode: "insensitive",
      };
    }

    if (filters.kota) {
      where.kota = {
        contains: filters.kota,
        mode: "insensitive",
      };
    }

    if (filters.provinsi) {
      where.provinsi = {
        contains: filters.provinsi,
        mode: "insensitive",
      };
    }

    if (filters.akreditasi) {
      where.akreditasi = filters.akreditasi;
    }

    return prisma.universitas.findMany({
      where,
      include: {
        _count: {
          select: {
            prodi_pt: true,
          },
        },
      },
      orderBy: {
        nama: "asc",
      },
      take: filters.limit || undefined,
      skip: filters.offset || undefined,
    });
  }

  // Search by nama
  async searchByNama(query: string, limit: number = 10) {
    return prisma.universitas.findMany({
      where: {
        nama: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: limit,
      orderBy: {
        nama: "asc",
      },
    });
  }

  // Find by provinsi
  async findByProvinsi(provinsi: string) {
    return this.findMany({ provinsi });
  }

  // Find by kota
  async findByKota(kota: string) {
    return this.findMany({ kota });
  }

  // Update universitas
  async update(university_id: number, data: Partial<CreateUniversitasDTO>) {
    return prisma.universitas.update({
      where: { university_id },
      data,
    });
  }

  // Delete universitas
  async delete(university_id: number) {
    return prisma.universitas.delete({
      where: { university_id },
    });
  }

  // Get count
  async count(filters: UniversitasFilters = {}) {
    const where: any = {};

    if (filters.nama) {
      where.nama = {
        contains: filters.nama,
        mode: "insensitive",
      };
    }

    if (filters.kota) {
      where.kota = {
        contains: filters.kota,
        mode: "insensitive",
      };
    }

    if (filters.provinsi) {
      where.provinsi = {
        contains: filters.provinsi,
        mode: "insensitive",
      };
    }

    return prisma.universitas.count({ where });
  }

  // Get all provinces
  async getAllProvinces() {
    const result = await prisma.universitas.findMany({
      select: { provinsi: true },
      where: {
        provinsi: { not: null },
      },
      distinct: ["provinsi"],
      orderBy: { provinsi: "asc" },
    });

    return result
      .map((item) => item.provinsi)
      .filter(Boolean) // Remove null values
      .sort();
  }

  // Get cities by province
  async getCitiesByProvince(provinsi: string) {
    const result = await prisma.universitas.findMany({
      select: { kota: true },
      where: {
        provinsi: provinsi,
        kota: { not: null },
      },
      distinct: ["kota"],
      orderBy: { kota: "asc" },
    });

    return result
      .map((item) => item.kota)
      .filter(Boolean) // Remove null values
      .sort();
  }

  // Check if exists by ID
  async exists(university_id: number): Promise<boolean> {
    const count = await prisma.universitas.count({
      where: { university_id },
    });
    return count > 0;
  }
}
