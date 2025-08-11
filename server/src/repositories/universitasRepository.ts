import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UniversitasRepository {
  async findAll() {
    return await prisma.universitas.findMany({
      orderBy: {
        nama: "asc",
      },
    });
  }

  async findById(university_id: number) {
    return await prisma.universitas.findUnique({
      where: { university_id },
    });
  }

  async findByProvinsi(provinsi: string) {
    return await prisma.universitas.findMany({
      where: {
        provinsi: {
          contains: provinsi,
          mode: "insensitive",
        },
      },
      orderBy: {
        nama: "asc",
      },
    });
  }

  async findByAkreditasi(akreditasi: string) {
    return await prisma.universitas.findMany({
      where: {
        akreditasi: {
          contains: akreditasi,
          mode: "insensitive",
        },
      },
      orderBy: {
        nama: "asc",
      },
    });
  }

  async searchByName(nama: string) {
    return await prisma.universitas.findMany({
      where: {
        nama: {
          contains: nama,
          mode: "insensitive",
        },
      },
      orderBy: {
        nama: "asc",
      },
    });
  }

  async getProvinsiList() {
    const result = await prisma.universitas.groupBy({
      by: ["provinsi"],
      orderBy: {
        provinsi: "asc",
      },
    });
    return result.map((item) => item.provinsi);
  }

  async getAkreditasiList() {
    const result = await prisma.universitas.groupBy({
      by: ["akreditasi"],
      orderBy: {
        akreditasi: "asc",
      },
    });
    return result.map((item) => item.akreditasi);
  }

  async findProdiByUniversitas(
    university_id: number,
    filter: { q?: string; jenjang?: string; skip?: number; take?: number }
  ) {
    const where: any = { university_id };
    const AND: any[] = [];
    if (filter?.q && filter.q.trim()) {
      AND.push({
        Prodi: {
          nama_prodi: { contains: filter.q.trim(), mode: "insensitive" },
        },
      });
    }
    if (filter?.jenjang && filter.jenjang.trim()) {
      AND.push({
        Prodi: {
          jenjang: {
            equals: filter.jenjang.trim(),
            mode: "insensitive",
          } as any,
        },
      });
    }
    if (AND.length) where.AND = AND;

    const [rows, total] = await Promise.all([
      prisma.prodiPT.findMany({
        where,
        include: {
          Prodi: {
            select: {
              prodi_id: true,
              nama_prodi: true,
              jenjang: true,
              bidang: true,
            },
          },
        },
        orderBy: [{ Prodi: { nama_prodi: "asc" } }],
        skip: filter?.skip,
        take: filter?.take,
      }),
      prisma.prodiPT.count({ where }),
    ]);

    return { rows, total };
  }
}
