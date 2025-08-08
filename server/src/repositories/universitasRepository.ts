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
}
