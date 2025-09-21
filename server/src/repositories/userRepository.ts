import { PrismaClient } from "@prisma/client";

interface CreateUserDTO {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  kelas: number;
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async create(data: CreateUserDTO) {
    return this.prisma.user.create({ data });
  }

  async updatePassword(email: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async updateProfile(
    userId: string,
    data: { firstname?: string; lastname?: string; kelas?: number }
  ) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: data,
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({ where: { user_id: userId } });
  }

  async findByName(firstname: string, lastname?: string) {
    const where: any = {
      firstname: {
        contains: firstname,
        mode: "insensitive",
      },
      role: "STUDENT",
    };

    if (lastname) {
      where.lastname = {
        contains: lastname,
        mode: "insensitive",
      };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        user_id: true,
        firstname: true,
        lastname: true,
        email: true,
        kelas: true,
      },
    });
  }

  // New methods for user management
  async findAllUsers() {
    return this.prisma.user.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async updateUser(userId: string, data: Partial<CreateUserDTO>) {
    return this.prisma.user.update({
      where: { user_id: userId },
      data: data,
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { user_id: userId },
    });
  }
}

// Create and export instance
export const userRepository = new UserRepository();
