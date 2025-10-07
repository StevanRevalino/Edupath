import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAkreditasi() {
  try {
    // Find Sistem Informasi prodi
    const prodis = await prisma.prodi.findMany({
      where: {
        nama_prodi: {
          contains: "Sistem Informasi",
          mode: "insensitive",
        },
      },
      include: {
        prodi_pt: {
          include: {
            universitas: true,
          },
          where: {
            universitas: {
              nama: {
                contains: "Airlangga",
                mode: "insensitive",
              },
            },
          },
        },
      },
      take: 1,
    });

    console.log("Found prodi:", JSON.stringify(prodis, null, 2));

    // Check all prodi_pt records with akreditasi
    const prodiPtWithAkreditasi = await prisma.prodiPT.findMany({
      where: {
        akreditasi_prodi: {
          not: null,
        },
      },
      include: {
        prodi: true,
        universitas: true,
      },
      take: 10,
    });

    console.log(
      "\nSample ProdiPT with akreditasi:",
      JSON.stringify(prodiPtWithAkreditasi, null, 2)
    );

    // Count how many have akreditasi vs don't
    const total = await prisma.prodiPT.count();
    const withAkreditasi = await prisma.prodiPT.count({
      where: {
        akreditasi_prodi: {
          not: null,
        },
      },
    });

    console.log(`\nTotal ProdiPT: ${total}`);
    console.log(`With Akreditasi: ${withAkreditasi}`);
    console.log(`Without Akreditasi: ${total - withAkreditasi}`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAkreditasi();
