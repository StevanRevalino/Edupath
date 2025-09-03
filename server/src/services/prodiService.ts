import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ProdiService {
  // Search prodi from local database
  async searchProdiLocal(query: string, limit: number = 20) {
    try {
      // Normalize query: trim, lowercase, split into words
      const normalizedQuery = query.trim().toLowerCase();
      const queryWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length >= 2);

      // If single word or very short, use simple search
      if (queryWords.length <= 1) {
        return this.simpleSearch(normalizedQuery, limit);
      }

      // Multi-word search with intelligent matching
      return this.multiWordSearch(queryWords, limit);
    } catch (error) {
      console.error("Error searching prodi locally:", error);
      throw error;
    }
  }

  // Simple search for single words
  private async simpleSearch(query: string, limit: number) {
    // First, search by prodi name (higher priority)
    const prodiNameResults = await prisma.prodi.findMany({
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
                nama_singkat: true,
                provinsi: true,
                akreditasi: true,
              },
            },
          },
        },
      },
    });

    // Then, search by university name (lower priority)
    const universityNameResults = await prisma.prodi.findMany({
      where: {
        prodi_pt: {
          some: {
            universitas: {
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
          },
        },
      },
      include: {
        prodi_pt: {
          include: {
            universitas: {
              select: {
                university_id: true,
                nama: true,
                nama_singkat: true,
                provinsi: true,
                akreditasi: true,
              },
            },
          },
        },
      },
    });

    // Combine results, prioritizing prodi name matches
    const combinedResults = [...prodiNameResults];

    // Add university name results that aren't already included
    for (const univResult of universityNameResults) {
      const alreadyExists = combinedResults.some(
        (existing) => existing.prodi_id === univResult.prodi_id
      );
      if (!alreadyExists) {
        combinedResults.push(univResult);
      }
    }

    return this.transformResults(combinedResults, limit);
  }

  // Multi-word search with intelligent matching
  private async multiWordSearch(queryWords: string[], limit: number) {
    // Get all potential matches
    const allResults = await prisma.prodi.findMany({
      include: {
        prodi_pt: {
          include: {
            universitas: {
              select: {
                university_id: true,
                nama: true,
                nama_singkat: true,
                provinsi: true,
                akreditasi: true,
              },
            },
          },
        },
      },
    });

    // Score and filter results
    const scoredResults = [];

    for (const prodi of allResults) {
      for (const pt of prodi.prodi_pt) {
        let score = 0;
        const prodiName = prodi.nama_prodi.toLowerCase();
        const univName = pt.universitas?.nama?.toLowerCase() || "";
        const univShortName = pt.universitas?.nama_singkat?.toLowerCase() || "";

        // Calculate score based on word matches
        for (const word of queryWords) {
          // Higher score for exact matches in prodi name
          if (prodiName.includes(word)) {
            score += 10;
          }
          // Medium score for university name matches
          if (univName.includes(word) || univShortName.includes(word)) {
            score += 5;
          }
          // Bonus for multiple word matches
          if (score > 10) {
            score += 2;
          }
        }

        // Only include results that match at least one word
        if (score > 0) {
          scoredResults.push({
            prodi,
            pt,
            score,
          });
        }
      }
    }

    // Sort by score (highest first) and transform
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        prodi_id: item.prodi.prodi_id.toString(),
        nama_prodi: item.prodi.nama_prodi,
        jenjang: item.prodi.jenjang,
        kode_prodi: null,
        bidang: null,
        akreditasi: item.pt.akreditasi_prodi,
        status: "Aktif",
        gelar: null,
        universitas: item.pt.universitas
          ? {
              university_id: item.pt.universitas.university_id.toString(),
              nama: item.pt.universitas.nama,
              provinsi: item.pt.universitas.provinsi,
            }
          : null,
      }));

    return sortedResults;
  }

  // Transform results to API format
  private transformResults(combinedResults: any[], limit: number) {
    const transformedResults = combinedResults.flatMap((prodi) =>
      prodi.prodi_pt.map((pt: any) => ({
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

    // Apply limit after transformation
    return transformedResults.slice(0, limit);
  }

  // Get prodi detail from local database
  async getProdiDetailLocal(prodiId: string) {
    try {
      const result = await prisma.prodi.findUnique({
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
}
