import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seedDefaultAdmins() {
  const defaultAdmins = [
    {
      user_id: "BK001",
      firstname: "Admin",
      lastname: "01",
      email: "gurubk01@gmail.com",
      password: "bk123456!",
    },
    {
      user_id: "BK002",
      firstname: "Admin",
      lastname: "02",
      email: "gurubk02@gmail.com",
      password: "bk123456!",
    },
    {
      user_id: "BK003",
      firstname: "Admin",
      lastname: "03",
      email: "gurubk03@gmail.com",
      password: "bk123456!",
    },
  ];

  for (const admin of defaultAdmins) {
    const exist = await prisma.user.findUnique({
      where: { user_id: admin.user_id },
    });

    if (!exist) {
      const hashed = await bcrypt.hash(admin.password, 10);
      await prisma.user.create({
        data: {
          user_id: admin.user_id,
          firstname: admin.firstname,
          lastname: admin.lastname,
          email: admin.email,
          password: hashed,
          kelas: 0,
        },
      });

      console.log(`✅ Admin ${admin.user_id} berhasil ditambahkan.`);
    }
  }
}
