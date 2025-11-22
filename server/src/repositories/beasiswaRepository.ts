import prisma from "../configs/prisma";

interface BeasiswaData {
  title: string;
  image_url: string;
  link: string;
}

export class BeasiswaRepository {
  constructor() {
    // Using singleton prisma instance
  }

  // Get all beasiswa
  async getAllBeasiswa() {
    return prisma.beasiswa.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
  }

  // Get beasiswa by ID
  async getBeasiswaById(id: string) {
    return prisma.beasiswa.findUnique({
      where: {
        beasiswa_id: id,
      },
    });
  }

  // Create new beasiswa
  async createBeasiswa(data: BeasiswaData) {
    return prisma.beasiswa.create({
      data: {
        title: data.title,
        image_url: data.image_url,
        link: data.link,
      },
    });
  }

  // Update beasiswa
  async updateBeasiswa(id: string, data: Partial<BeasiswaData>) {
    return prisma.beasiswa.update({
      where: {
        beasiswa_id: id,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.image_url && { image_url: data.image_url }),
        ...(data.link && { link: data.link }),
      },
    });
  }

  // Delete beasiswa
  async deleteBeasiswa(id: string) {
    return prisma.beasiswa.delete({
      where: {
        beasiswa_id: id,
      },
    });
  }
}

export const beasiswaRepository = new BeasiswaRepository();
