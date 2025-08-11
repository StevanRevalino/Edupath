import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type ProdiFilter = {
  q?: string;
  jenjang?: string;
  bidang?: string;
  skip?: number;
  take?: number;
};

export class ProdiRepository {
  private buildWhere({ q, jenjang, bidang }: ProdiFilter) {
    const where: any = {};
    if (q && q.trim()) {
      where.nama_prodi = { contains: q.trim(), mode: "insensitive" };
    }
    if (jenjang && jenjang.trim()) {
      where.jenjang = { equals: jenjang.trim(), mode: "insensitive" } as any;
    }
    if (bidang && bidang.trim()) {
      where.bidang = { contains: bidang.trim(), mode: "insensitive" };
    }
    return where;
  }

  async findMany(filter: ProdiFilter) {
    const { skip, take } = filter;
    const where = this.buildWhere(filter);
    return prisma.prodi.findMany({
      where,
      orderBy: { nama_prodi: "asc" },
      skip,
      take,
    });
  }

  async count(filter: ProdiFilter) {
    const where = this.buildWhere(filter);
    return prisma.prodi.count({ where });
  }

  async findById(prodi_id: number) {
    return prisma.prodi.findUnique({ where: { prodi_id } });
  }

  async findUniversitasByProdi(prodi_id: number) {
    return prisma.prodiPT.findMany({
      where: { prodi_id },
      include: {
        Universitas: {
          select: {
            university_id: true,
            nama: true,
            provinsi: true,
            akreditasi: true,
            status: true,
          },
        },
      },
      orderBy: [{ Universitas: { nama: "asc" } }],
    });
  }

  async getJenjangList() {
    const rows = await prisma.prodi.groupBy({
      by: ["jenjang"],
      orderBy: { jenjang: "asc" },
    });
    return rows.map((r) => r.jenjang).filter(Boolean);
  }
}
