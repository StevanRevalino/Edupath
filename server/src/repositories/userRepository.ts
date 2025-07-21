import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateUserDTO {
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

  async updateOTP(email: string, otp: string, otp_expires: Date) {
    return prisma.user.update({
      where: { email },
      data: { otp, otp_expires },
    });
  }

  async verifyOTP(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp || new Date() > user.otp_expires!) return null;
    return user;
  }
}
