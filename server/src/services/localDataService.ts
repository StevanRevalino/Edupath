import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class LocalDataService {
  // Get university detail by ID from local database
  async getUniversitasById(universityId: string) {
    try {
      const universitas = await prisma.localUniversitas.findUnique({
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

      if (!universitas) {
        throw new Error(
          `Universitas dengan ID ${universityId} tidak ditemukan`
        );
      }

      // Transform to match expected format
      return {
        university_id: universitas.university_id.toString(),
        nama: universitas.nama,
        nama_singkat: universitas.nama_singkat,
        kelompok: null, // Not available in local database
        pembina: null, // Not available in local database
        alamat: universitas.alamat,
        kecamatan: null, // Not available in local database
        kota: universitas.kota,
        provinsi: universitas.provinsi,
        kode_pos: universitas.kode_pos,
        lintang: null, // Not available in local database
        bujur: null, // Not available in local database
        email: universitas.email,
        telepon: universitas.telepon,
        fax: universitas.fax,
        website: null, // Not available in local database
        tanggal_berdiri: null, // Not available in local database
        akreditasi: universitas.akreditasi,
        status_akreditasi: universitas.status,
        rank_qs: universitas.rank_qs ? parseFloat(universitas.rank_qs) : null,
        rank_country: universitas.rank_country
          ? parseFloat(universitas.rank_country)
          : null,
      };
    } catch (error) {
      console.error("Error getting universitas by ID:", error);
      throw error;
    }
  }

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
    const prodiNameResults = await prisma.localProdi.findMany({
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
    const universityNameResults = await prisma.localProdi.findMany({
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
    const allResults = await prisma.localProdi.findMany({
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
  } // Get prodi detail from local database
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
      // Normalize query: trim, lowercase, split into words
      const normalizedQuery = query.trim().toLowerCase();
      const queryWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length >= 2);

      // If single word or very short, use simple search
      if (queryWords.length <= 1) {
        return this.simpleUniversitasSearch(normalizedQuery, limit);
      }

      // Multi-word search with intelligent matching
      return this.multiWordUniversitasSearch(queryWords, limit);
    } catch (error) {
      console.error("Error searching universitas locally:", error);
      throw error;
    }
  }

  // Simple search for single words (universitas)
  private async simpleUniversitasSearch(query: string, limit: number) {
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
          {
            kota: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            provinsi: {
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
      take: limit * 3, // Get more results for smart scoring
    });

    // Apply smart scoring even for simple search
    const scoredResults = [];

    for (const univ of results) {
      let score = 0;
      const univName = univ.nama.toLowerCase();
      const univShortName = univ.nama_singkat?.toLowerCase() || "";
      const kota = univ.kota?.toLowerCase() || "";
      const provinsi = univ.provinsi?.toLowerCase() || "";

      // Smart nickname detection for single word
      const nicknameScore = this.calculateNicknameScore(
        query,
        univName,
        univShortName
      );
      if (nicknameScore > 0) {
        score += nicknameScore;
      }

      // Higher score for exact matches in university name
      if (univName.includes(query)) {
        score += 10;
      }
      // Medium score for short name matches
      if (univShortName.includes(query)) {
        score += 8;
      }
      // Lower score for city/province matches
      if (kota.includes(query) || provinsi.includes(query)) {
        score += 3;
      }

      // Only include results that match at least one criterion
      if (score > 0) {
        scoredResults.push({
          univ,
          score,
        });
      }
    }

    // Sort by score (highest first) and apply limit
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.univ);

    return this.transformUniversitasResults(sortedResults);
  }

  // Multi-word search with intelligent matching (universitas)
  private async multiWordUniversitasSearch(
    queryWords: string[],
    limit: number
  ) {
    // Get all potential matches
    const allResults = await prisma.localUniversitas.findMany({
      include: {
        prodi_pt: {
          include: {
            prodi: true,
          },
        },
      },
    });

    // Score and filter results
    const scoredResults = [];

    for (const univ of allResults) {
      let score = 0;
      const univName = univ.nama.toLowerCase();
      const univShortName = univ.nama_singkat?.toLowerCase() || "";
      const kota = univ.kota?.toLowerCase() || "";
      const provinsi = univ.provinsi?.toLowerCase() || "";

      // Calculate score based on word matches
      for (const word of queryWords) {
        // Smart nickname detection based on university name patterns
        const nicknameScore = this.calculateNicknameScore(
          word,
          univName,
          univShortName
        );
        if (nicknameScore > 0) {
          score += nicknameScore;
          continue;
        }

        // Higher score for exact matches in university name
        if (univName.includes(word)) {
          score += 10;
        }
        // Medium score for short name matches
        if (univShortName.includes(word)) {
          score += 8;
        }
        // Lower score for city/province matches
        if (kota.includes(word) || provinsi.includes(word)) {
          score += 3;
        }
        // Bonus for multiple word matches
        if (score > 10) {
          score += 2;
        }
      }

      // Only include results that match at least one word
      if (score > 0) {
        scoredResults.push({
          univ,
          score,
        });
      }
    }

    // Sort by score (highest first) and transform
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.univ);

    return this.transformUniversitasResults(sortedResults);
  }

  // Transform universitas results to API format
  private transformUniversitasResults(results: any[]) {
    return results.map((univ) => ({
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

  // Smart nickname detection algorithm
  private calculateNicknameScore(
    searchWord: string,
    univName: string,
    univShortName: string
  ): number {
    // If short name exists and matches exactly, high score
    if (univShortName && univShortName === searchWord) {
      return 30; // Highest score for exact short name match
    }

    // Check if search word matches existing short name patterns
    if (univShortName && univShortName.includes(searchWord)) {
      return 25; // Very high score for partial short name match
    }

    // Check if short name is contained in search word (for longer searches)
    if (
      univShortName &&
      searchWord.length >= 4 &&
      searchWord.includes(univShortName)
    ) {
      return 25; // Very high score when short name is part of search
    }

    // Check for special cases first (like 'binus' for 'bina nusantara')
    if (this.isSpecialNickname(searchWord, univName.toLowerCase())) {
      return 25;
    }

    // Algorithm to detect common nickname patterns
    const univWords = univName
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 &&
          ![
            "universitas",
            "institut",
            "sekolah",
            "politeknik",
            "akademi",
            "dan",
            "di",
            "negeri",
          ].includes(word.toLowerCase())
      );

    // Check if search word is a significant part of any university word
    for (const word of univWords) {
      const lowerWord = word.toLowerCase();

      // Exact match with significant words
      if (lowerWord === searchWord) {
        return 25; // Increased score for exact match
      }

      // Check if search word is contained in university word (minimum 3 chars)
      if (searchWord.length >= 3 && lowerWord.includes(searchWord)) {
        // Higher score if search word is substantial part of the university word
        const matchRatio = searchWord.length / lowerWord.length;
        if (matchRatio >= 0.6) {
          return 22; // High score for substantial match
        } else if (matchRatio >= 0.4) {
          return 18; // Medium score
        } else {
          return 15; // Lower score but still significant
        }
      }

      // Check if university word starts with search word (prefix match)
      if (searchWord.length >= 3 && lowerWord.startsWith(searchWord)) {
        return 20;
      }

      // Check common abbreviation patterns
      if (
        searchWord.length >= 3 &&
        this.isLikelyAbbreviation(searchWord, lowerWord)
      ) {
        return 16;
      }
    }

    // Try to match acronyms (first letters of important words)
    const acronym = univWords
      .map((word) => word.charAt(0).toLowerCase())
      .join("");

    if (searchWord === acronym && acronym.length >= 2) {
      return 25; // Very high score for perfect acronym match
    }

    // Check partial acronym matches
    if (searchWord.length >= 2 && acronym.includes(searchWord)) {
      return 20;
    }

    // Check for common university type prefixes
    if (
      searchWord.startsWith("un") &&
      univName.toLowerCase().includes("universitas")
    ) {
      // Extract the main part after 'un'
      const mainPart = searchWord.substring(2);
      for (const word of univWords) {
        if (word.toLowerCase().startsWith(mainPart)) {
          return 20;
        }
      }
    }

    return 0; // No nickname match found
  }

  // Helper method to detect likely abbreviations
  private isLikelyAbbreviation(searchWord: string, univWord: string): boolean {
    // Check if search word could be formed by taking first few chars + last few chars
    if (searchWord.length >= 3 && univWord.length >= 6) {
      const prefix = univWord.substring(0, Math.ceil(searchWord.length / 2));
      const suffix = univWord.substring(
        univWord.length - Math.floor(searchWord.length / 2)
      );

      if (searchWord === (prefix + suffix).toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  // Special cases for well-known university nicknames
  private isSpecialNickname(searchWord: string, univName: string): boolean {
    const specialCases: { [key: string]: string[] } = {
      binus: ["bina nusantara"],
      telkom: ["telkom", "telekomunikasi"],
      trisakti: ["trisakti"],
      atmajaya: ["atma jaya"],
      petra: ["petra"],
      tarumanagara: ["tarumanagara"],
      ubaya: ["surabaya"],
      uph: ["pelita harapan"],
      umn: ["multimedia nusantara"],
    };

    // Direct match check
    if (specialCases[searchWord]) {
      return specialCases[searchWord].some((keyword) =>
        univName.includes(keyword)
      );
    }

    // Flexible matching for partial names and common variations
    const flexibleMatches: { [key: string]: string[] } = {
      // Tarumanagara variations
      taruma: ["tarumanagara"],
      tarumanegara: ["tarumanagara"], // common typo
      untar: ["tarumanagara"],

      // Binus variations
      bin: ["bina nusantara"],
      binus: ["bina nusantara"],

      // Telkom variations
      tel: ["telkom"],
      telko: ["telkom"],

      // Petra variations
      pet: ["petra"],
      ukp: ["petra"], // Universitas Kristen Petra

      // Atmajaya variations
      atma: ["atma jaya"],
      jaya: ["atma jaya"],
      uaj: ["atma jaya"],

      // UPH variations
      pelita: ["pelita harapan"],
      harapan: ["pelita harapan"],

      // UMN variations
      multimedia: ["multimedia nusantara"],
      nusantara: ["multimedia nusantara"],

      // Common university short names
      ui: ["universitas indonesia"],
      itb: ["institut teknologi bandung"],
      ugm: ["universitas gadjah mada"],
      its: ["institut teknologi sepuluh"],
      unair: ["universitas airlangga"],
      undip: ["universitas diponegoro"],
      uns: ["universitas sebelas maret"],
      unpad: ["universitas padjadjaran"],
      uny: ["universitas negeri yogyakarta"],
      unnes: ["universitas negeri semarang"],
      unm: ["universitas negeri makassar"],
      unimed: ["universitas negeri medan"],
      upi: ["universitas pendidikan indonesia"],
      usu: ["universitas sumatera utara"],
      unsri: ["universitas sriwijaya"],
      unand: ["universitas andalas"],
      unhas: ["universitas hasanuddin"],
      unsyiah: ["universitas syiah kuala"],
      unlam: ["universitas lambung mangkurat"],
      unram: ["universitas mataram"],
      uncen: ["universitas cenderawasih"],
      unud: ["universitas udayana"],
      unesa: ["universitas negeri surabaya"],
      unmul: ["universitas mulawarman"],
      untad: ["universitas tadulako"],
      untirta: ["universitas sultan ageng tirtayasa"],
      upn: ["universitas pembangunan nasional"],
    };

    // Check flexible matches
    if (flexibleMatches[searchWord]) {
      return flexibleMatches[searchWord].some((keyword) =>
        univName.includes(keyword)
      );
    }

    // Check if searchWord is a substantial part of any special university name
    for (const [nickname, keywords] of Object.entries(specialCases)) {
      for (const keyword of keywords) {
        // Check if search word is contained in keyword and is substantial
        if (searchWord.length >= 4 && keyword.includes(searchWord)) {
          const matchRatio = searchWord.length / keyword.length;
          if (matchRatio >= 0.5 && univName.includes(keyword)) {
            return true;
          }
        }

        // Check if keyword is contained in search word (for longer search terms)
        if (searchWord.length >= 6 && searchWord.includes(keyword)) {
          if (univName.includes(keyword)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
