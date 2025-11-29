import { Request, Response } from "express";
import { UniversitasPddiktiService } from "../services/universitasPddiktiService";
import prisma from "../configs/prisma";

export class UniversitasController {
  private universitasService: UniversitasPddiktiService;

  constructor() {
    this.universitasService = new UniversitasPddiktiService();

    // Bind methods to preserve 'this' context
    this.getAllUniversitas = this.getAllUniversitas.bind(this);
    this.getUniversitasById = this.getUniversitasById.bind(this);
    this.searchUniversitas = this.searchUniversitas.bind(this);
  }

  // ==================== HELPER METHODS ====================

  // Simple search for single words (universitas)
  private async simpleUniversitasSearch(query: string, limit: number) {
    try {
      // For advanced nickname search, we need to get more data for scoring
      // First try exact name search
      const nameResults = await prisma.universitas.findMany({
        where: {
          nama: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          _count: {
            select: {
              prodi_pt: true,
            },
          },
        },
        take: limit * 2, // Get some results for smart scoring
      });

      // Also get additional data for nickname matching if name search is limited
      const allResults = await prisma.universitas.findMany({
        include: {
          _count: {
            select: {
              prodi_pt: true,
            },
          },
        },
        take: 500, // Get more results for advanced nickname matching
      });

      // Combine results, prioritizing name matches
      const combinedResults = [...nameResults];
      const nameResultIds = new Set(nameResults.map((r) => r.university_id));

      // Add non-duplicate results from all results for nickname matching
      for (const result of allResults) {
        if (!nameResultIds.has(result.university_id)) {
          combinedResults.push(result);
        }
      }

      if (!combinedResults || combinedResults.length === 0) {
        return [];
      }

      // Apply smart scoring even for simple search
      const scoredResults = [];

      for (const univ of combinedResults) {
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
    } catch (error) {
      console.error("Error in simpleUniversitasSearch:", error);
      throw error;
    }
  }

  // Multi-word search with intelligent matching (universitas)
  private async multiWordUniversitasSearch(
    queryWords: string[],
    limit: number
  ) {
    // Get all potential matches
    const allResults = await prisma.universitas.findMany({
      include: {
        _count: {
          select: {
            prodi_pt: true,
          },
        },
      },
      take: 1000, // Get more results for multi-word matching
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
      rank_qs: univ.rank_qs,
      rank_country: univ.rank_country,
      jumlah_prodi: univ._count?.prodi_pt || 0,
    }));
  }

  // Search universitas from local database
  private async searchUniversitasLocal(query: string, limit: number = 20) {
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

  // Get universitas detail from local database
  private async getUniversitasDetailLocal(universityId: string) {
    try {
      const result = await prisma.universitas.findUnique({
        where: { university_id: parseInt(universityId) },
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
        rank_qs: result.rank_qs,
        rank_country: result.rank_country,
        prodi: result.prodi_pt.map((pt: any) => ({
          prodi_id: pt.prodi.prodi_id.toString(),
          nama_prodi: pt.prodi.nama_prodi,
          jenjang: pt.prodi.jenjang,
        })),
      };

      return transformedResult;
    } catch (error) {
      console.error("Error getting universitas detail locally:", error);
      throw error;
    }
  }

  // ==================== MAIN METHODS ====================

  // Get all universitas with optional pagination and search
  async getAllUniversitas(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit,
        search = "",
        akreditasi = "",
        provinsi = "",
      } = req.query as any;

      const hasSearch = search && search.trim().length > 0;
      const hasFilter =
        (akreditasi && akreditasi !== "Semua") ||
        (provinsi && provinsi !== "Semua");

      // Logic:
      // 1. Search with keyword → limit 15
      // 2. Filter only (no search) → no limit (get all matching)
      // 3. No filter, no search → limit 15 sorted by QS rank ascending
      let take: number;
      if (hasSearch) {
        take = 15; // Search always limited to 15 best matches
      } else if (hasFilter) {
        take = 10000; // Filter without search gets all data
      } else {
        take = limit
          ? Math.min(Math.max(parseInt(limit as string, 10) || 15, 1), 1000)
          : 15;
      }

      const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
      const skip = (pageNum - 1) * take;

      // If search keyword exists, use search function (limit 15)
      if (search && search.trim().length > 0) {
        const searchResults = await this.searchUniversitasLocal(
          search.trim(),
          take
        );
        return res.json({
          message: "Berhasil mengambil daftar universitas",
          data: searchResults,
          total: searchResults.length,
          page: pageNum,
          limit: take,
        });
      }

      // Get all universitas without search
      const hasFilterApplied =
        (akreditasi && akreditasi !== "Semua") ||
        (provinsi && provinsi !== "Semua");

      // When no filter, fetch more data to sort properly by QS rank
      const fetchLimit = hasFilterApplied ? take : 10000; // Fetch all data when no filter for proper sorting

      const allUniversitas = await prisma.universitas.findMany({
        include: {
          _count: {
            select: {
              prodi_pt: true,
            },
          },
        },
        take: fetchLimit,
      });

      // Apply filters
      let filteredUniversitas = [...allUniversitas];

      if (akreditasi && akreditasi !== "Semua") {
        filteredUniversitas = filteredUniversitas.filter(
          (u) => u.akreditasi === akreditasi
        );
      }

      if (provinsi && provinsi !== "Semua") {
        filteredUniversitas = filteredUniversitas.filter(
          (u) => u.provinsi === provinsi
        );
      }

      // Sort by QS rank ascending when no filter (default behavior)
      if (!hasFilterApplied) {
        // Default: sort by QS rank ascending (lower number = better rank)
        filteredUniversitas.sort((a, b) => {
          const rankA = a.rank_qs ? parseFloat(a.rank_qs) : Infinity;
          const rankB = b.rank_qs ? parseFloat(b.rank_qs) : Infinity;
          return rankA - rankB;
        });
        // Limit to requested amount after sorting
        filteredUniversitas = filteredUniversitas.slice(0, take);
      }

      const transformedResults = filteredUniversitas.map((univ) => ({
        university_id: univ.university_id.toString(),
        nama: univ.nama,
        nama_singkat: univ.nama_singkat,
        kelompok: null,
        pembina: null,
        alamat: univ.alamat,
        kecamatan: null,
        kota: univ.kota,
        provinsi: univ.provinsi,
        kode_pos: univ.kode_pos,
        lintang: null,
        bujur: null,
        email: univ.email,
        telepon: univ.telepon,
        fax: univ.fax,
        website: null,
        tanggal_berdiri: null,
        akreditasi: univ.akreditasi,
        rank_qs: univ.rank_qs ? parseFloat(univ.rank_qs) : null,
        rank_country: univ.rank_country ? parseFloat(univ.rank_country) : null,
      }));

      res.json({
        message: "Berhasil mengambil daftar universitas",
        data: transformedResults,
        total: filteredUniversitas.length,
        page: pageNum,
        limit: take,
      });
    } catch (e: any) {
      res.status(500).json({
        message: "Gagal mengambil daftar universitas",
        error: e.message,
      });
    }
  }
  async getUniversitasById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({
          message: "ID universitas tidak valid",
        });
      }

      // Use direct Prisma query for local data
      const universitas = await prisma.universitas.findUnique({
        where: { university_id: parseInt(id.trim()) },
      });

      if (!universitas) {
        return res.status(404).json({
          message: `Universitas dengan ID ${id.trim()} tidak ditemukan`,
        });
      }

      // Transform to match expected format
      const transformedResult = {
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
        rank_qs: universitas.rank_qs ? parseFloat(universitas.rank_qs) : null,
        rank_country: universitas.rank_country
          ? parseFloat(universitas.rank_country)
          : null,
      };

      res.status(200).json({
        message: "Berhasil mengambil data universitas",
        data: transformedResult,
      });
    } catch (error: any) {
      if (error.message.includes("tidak ditemukan")) {
        res.status(404).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: "Gagal mengambil data universitas",
          error: error.message,
        });
      }
    }
  }

  async searchUniversitas(req: Request, res: Response) {
    try {
      const { nama } = req.query;

      if (!nama || typeof nama !== "string") {
        return res.status(400).json({
          message: "Parameter nama diperlukan untuk pencarian",
        });
      }

      if (nama.trim().length < 2) {
        return res.status(400).json({
          message: "Nama universitas harus minimal 2 karakter",
        });
      }

      // Use local database (from CSV dataset) with smart search
      const localData = await this.searchUniversitasLocal(nama.trim(), 15);
      res.status(200).json({
        message: `Berhasil mencari universitas dengan nama: ${nama.trim()} (dataset lokal)`,
        data: localData,
        total: localData.length,
        source: "local",
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mencari universitas",
        error: error.message,
      });
    }
  }
}
