import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LocalDataService {
  // Search prodi from local database
  async searchProdiLocal(query: string, limit: number = 20) {
    try {
      const results = await prisma.localProdi.findMany({
        where: {
          nama_prodi: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          prodi_pt: {
            include: {
              universitas: {
                select: {
                  university_id: true,
                  nama: true,
                  provinsi: true,
                  akreditasi: true,
                },
              },
            },
          },
        },
        take: limit,
      });

      // Transform to match API format
      const transformedResults = results.flatMap((prodi) =>
        prodi.prodi_pt.map((pt) => ({
          prodi_id: prodi.prodi_id.toString(),
          nama_prodi: prodi.nama_prodi,
          jenjang: prodi.jenjang,
          kode_prodi: null,
          bidang: null,
          akreditasi: pt.akreditasi_prodi,
          status: "Aktif",
          gelar: null,
          universitas: pt.universitas
            ? {
                university_id: pt.universitas.university_id.toString(),
                nama: pt.universitas.nama,
                provinsi: pt.universitas.provinsi,
              }
            : null,
        }))
      );

      return transformedResults;
    } catch (error) {
      console.error("Error searching prodi locally:", error);
      throw error;
    }
  }

  // Get prodi detail from local database
  async getProdiDetailLocal(prodiId: string) {
    try {
      const result = await prisma.localProdi.findUnique({
        where: {
          prodi_id: parseInt(prodiId),
        },
        include: {
          prodi_pt: {
            include: {
              universitas: true,
            },
          },
        },
      });

      if (!result) {
        return null;
      }

      // Transform to match API format
      const transformedResult = {
        prodi_id: result.prodi_id.toString(),
        nama_prodi: result.nama_prodi,
        jenjang: result.jenjang,
        kode_prodi: null,
        bidang: null,
        akreditasi: result.prodi_pt[0]?.akreditasi_prodi || null,
        status_akreditasi: result.prodi_pt[0]?.akreditasi_prodi || null,
        tanggal_berdiri: null,
        tanggal_tutup: null,
        status: "Aktif",
        gelar: null,
        singkatan_gelar: null,
        deskripsi: null,
      };

      return transformedResult;
    } catch (error) {
      console.error("Error getting prodi detail locally:", error);
      throw error;
    }
  }

  // Search universitas from local database
  async searchUniversitasLocal(query: string, limit: number = 20) {
    try {
      const results = await prisma.localUniversitas.findMany({
        where: {
          OR: [
            {
              nama: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              nama_singkat: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          prodi_pt: {
            include: {
              prodi: true,
            },
          },
        },
        take: limit,
      });

      // Transform to match API format
      const transformedResults = results.map((univ) => ({
        university_id: univ.university_id.toString(),
        nama: univ.nama,
        npsn: univ.npsn,
        nama_singkat: univ.nama_singkat,
        kode_pos: univ.kode_pos,
        telepon: univ.telepon,
        fax: univ.fax,
        email: univ.email,
        alamat: univ.alamat,
        kota: univ.kota,
        provinsi: univ.provinsi,
        akreditasi: univ.akreditasi,
        status: univ.status,
        rank_qs: univ.rank_qs,
        rank_country: univ.rank_country,
        jumlah_prodi: univ.prodi_pt.length,
      }));

      return transformedResults;
    } catch (error) {
      console.error("Error searching universitas locally:", error);
      throw error;
    }
  }

  // Get universitas detail from local database
  async getUniversitasDetailLocal(universityId: string) {
    try {
      const result = await prisma.localUniversitas.findUnique({
        where: {
          university_id: parseInt(universityId),
        },
        include: {
          prodi_pt: {
            include: {
              prodi: true,
            },
          },
        },
      });

      if (!result) {
        return null;
      }

      // Transform to match API format
      const transformedResult = {
        university_id: result.university_id.toString(),
        nama: result.nama,
        npsn: result.npsn,
        nama_singkat: result.nama_singkat,
        kode_pos: result.kode_pos,
        telepon: result.telepon,
        fax: result.fax,
        email: result.email,
        alamat: result.alamat,
        kota: result.kota,
        provinsi: result.provinsi,
        akreditasi: result.akreditasi,
        status: result.status,
        rank_qs: result.rank_qs,
        rank_country: result.rank_country,
        prodi: result.prodi_pt.map((pt) => ({
          prodi_id: pt.prodi.prodi_id.toString(),
          nama_prodi: pt.prodi.nama_prodi,
          jenjang: pt.prodi.jenjang,
          akreditasi: pt.akreditasi_prodi,
        })),
      };

      return transformedResult;
    } catch (error) {
      console.error("Error getting universitas detail locally:", error);
      throw error;
    }
  }

  // Get database statistics
  async getLocalDataStats() {
    try {
      const stats = {
        universities: await prisma.localUniversitas.count(),
        prodi: await prisma.localProdi.count(),
        relations: await prisma.localProdiPT.count(),
        last_updated: new Date(),
      };

      return stats;
    } catch (error) {
      console.error("Error getting local data stats:", error);
      throw error;
    }
  }
}
