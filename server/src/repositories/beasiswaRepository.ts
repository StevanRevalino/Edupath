import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BeasiswaData {
  title: string;
  image_url: string;
  link: string;
}

// Get all beasiswa
export const getAllBeasiswa = async () => {
  return await prisma.beasiswa.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
};

// Get beasiswa by ID
export const getBeasiswaById = async (id: string) => {
  return await prisma.beasiswa.findUnique({
    where: {
      beasiswa_id: id,
    },
  });
};

// Create new beasiswa
export const createBeasiswa = async (data: BeasiswaData) => {
  return await prisma.beasiswa.create({
    data: {
      title: data.title,
      image_url: data.image_url,
      link: data.link,
    },
  });
};

// Update beasiswa
export const updateBeasiswa = async (
  id: string,
  data: Partial<BeasiswaData>
) => {
  return await prisma.beasiswa.update({
    where: {
      beasiswa_id: id,
    },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.image_url && { image_url: data.image_url }),
      ...(data.link && { link: data.link }),
    },
  });
};

// Delete beasiswa
export const deleteBeasiswa = async (id: string) => {
  return await prisma.beasiswa.delete({
    where: {
      beasiswa_id: id,
    },
  });
};
