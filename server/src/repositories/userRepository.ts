import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserDTO {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  kelas: number;
}

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDTO) {
    return prisma.user.create({ data });
  }
}
