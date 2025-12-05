import { Request, Response } from "express";
import prisma from "../configs/prisma";

export class ProdiController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getAllProdi = this.getAllProdi.bind(this);
    this.getProdiById = this.getProdiById.bind(this);
    this.searchProdiByName = this.searchProdiByName.bind(this);
  }

  // ===== HELPER METHODS FOR SEARCH ALGORITHM =====

  /**
   * Helper: Create acronym from string
   */
  private makeAcronym(s: string): string {
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toLowerCase();
  }

  /**
   * Helper: Normalize university name variations
   */
  private normalizeUnivName(name: string): string {
    return name
      .toLowerCase()
      .replace(/^universitas\s+/i, "")
      .replace(/^institut\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Helper: Check if words are in sequence
   */
  private hasSequentialMatch(text: string, words: string[]): boolean {
    if (words.length === 0) return false;

    const pattern = words.join("\\s+");
    const regex = new RegExp(pattern, "i");
    return regex.test(text);
  }

  /**
   * Helper: Main scoring algorithm for search relevance
   */
  private computeScore({
    prodiName,
    univName,
    univShort,
    words,
    originalQuery,
  }: {
    prodiName: string;
    univName: string;
    univShort: string;
    words: string[];
    originalQuery: string;
  }): number {
    let score = 0;

    const q = originalQuery.toLowerCase().trim();
    const prodiAcr = this.makeAcronym(prodiName);
    const univAcr = this.makeAcronym(univName);
    const univShortAcr = this.makeAcronym(univShort);

    const normalizedUnivName = this.normalizeUnivName(univName);
    const normalizedUnivShort = this.normalizeUnivName(univShort);

    // === KOMBINASI PRODI + UNIVERSITAS (Prioritas Tertinggi) ===
    // Contoh: "ti binus", "informatika ui", "teknik unpad"

    // Split query into potential prodi and univ parts
    const hasProdiWord = words.some(
      (w) => prodiName.includes(w) || prodiAcr.includes(w)
    );
    const hasUnivWord = words.some(
      (w) =>
        univName.includes(w) ||
        univShort.includes(w) ||
        normalizedUnivName.includes(w) ||
        normalizedUnivShort.includes(w)
    );

    // Boost combination matches significantly
    if (hasProdiWord && hasUnivWord) {
      score += 100; // Major boost for queries mentioning both

      // Extra boost if both match well
      const prodiMatches = words.filter((w) => prodiName.includes(w)).length;
      const univMatches = words.filter(
        (w) => univName.includes(w) || univShort.includes(w)
      ).length;

      score += (prodiMatches + univMatches) * 15;
    }

    // === EXACT MATCHES (Very High Priority) ===
    if (prodiName === q) score += 200;
    if (univName === q || univShort === q) score += 150;
    if (normalizedUnivName === q || normalizedUnivShort === q) score += 140;

    // === ACRONYM MATCHES ===
    // "ti" for "Teknik Informatika", "ui" for "Universitas Indonesia"
    if (q === prodiAcr) score += 120;
    if (q === univAcr || q === univShortAcr) score += 90;

    // Partial acronym match (for multi-word queries)
    if (words.length > 1) {
      const combinedAcronym = words.join("");
      const fullAcronym = prodiAcr + univAcr;
      const fullAcronymShort = prodiAcr + univShortAcr;

      if (
        combinedAcronym === fullAcronym ||
        combinedAcronym === fullAcronymShort
      ) {
        score += 150;
      }
    }

    // === PRODI NAME MATCHES ===
    if (prodiName.includes(q)) score += 80;
    if (prodiName.startsWith(q)) score += 60;

    // Sequential word matching in prodi
    if (this.hasSequentialMatch(prodiName, words)) score += 50;

    // Individual word matches in prodi
    let prodiWordMatches = 0;
    for (const w of words) {
      if (prodiName.includes(w)) {
        prodiWordMatches++;
        score += 25;
        if (prodiName.startsWith(w)) score += 15;
      }
    }

    // === UNIVERSITY NAME MATCHES ===
    if (univName.includes(q) || univShort.includes(q)) score += 50;
    if (normalizedUnivName.includes(q) || normalizedUnivShort.includes(q))
      score += 55;
    if (univName.startsWith(q) || univShort.startsWith(q)) score += 40;

    // Sequential word matching in university
    if (this.hasSequentialMatch(univName + " " + univShort, words)) score += 35;

    // Individual word matches in university
    let univWordMatches = 0;
    for (const w of words) {
      if (univName.includes(w) || univShort.includes(w)) {
        univWordMatches++;
        score += 15;
        if (univName.startsWith(w) || univShort.startsWith(w)) score += 10;
      }
      if (normalizedUnivName.includes(w) || normalizedUnivShort.includes(w)) {
        score += 12;
      }
    }

    // === COVERAGE BONUS ===
    // Reward results that match more query words
    const totalWordMatches = prodiWordMatches + univWordMatches;
    const coverageRatio = totalWordMatches / words.length;

    if (coverageRatio >= 0.5) score += 20;
    if (coverageRatio >= 0.75) score += 30;
    if (coverageRatio === 1.0) score += 50; // All words matched

    // === COMMON ABBREVIATIONS ===
    const commonAbbreviations: Record<string, string[]> = {
      ti: ["teknik informatika", "teknologi informasi"],
      si: ["sistem informasi"],
      te: ["teknik elektro"],
      tm: ["teknik mesin"],
      ak: ["akuntansi"],
      mn: ["manajemen"],
      hk: ["hukum"],
      psi: ["psikologi"],
      kedokteran: ["fk", "kedokteran"],
    };

    for (const [abbr, fullNames] of Object.entries(commonAbbreviations)) {
      if (words.includes(abbr)) {
        if (fullNames.some((fn) => prodiName.includes(fn))) {
          score += 80;
        }
      }
    }

    // === PENALTIES ===
    // Penalize if only university matches (without prodi relevance)
    if (univWordMatches > 0 && prodiWordMatches === 0 && !hasProdiWord) {
      score -= 40;
    }

    // Penalize partial matches if there's no strong connection
    if (totalWordMatches < words.length && score < 50) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * Helper: Intelligent search combining all strategies
   */
  private async intelligentSearch(
    originalQuery: string,
    queryWords: string[],
    limit: number
  ) {
    const allProdi = await prisma.prodi.findMany({ take: 2000 });
    const allResults = await Promise.all(
      allProdi.map(async (prodi) =>
        prisma.prodi.findUnique({
          where: { prodi_id: prodi.prodi_id },
          include: {
            prodi_pt: {
              include: {
                universitas: true,
              },
            },
          },
        })
      )
    );

    const scoredResults: Array<{
      prodi: any;
      pt: any;
      score: number;
    }> = [];

    for (const prodi of allResults) {
      if (!prodi || !prodi.prodi_pt) continue;

      const prodiName = (prodi.nama_prodi || "").toLowerCase();

      for (const pt of prodi.prodi_pt) {
        const univName = (pt.universitas?.nama || "").toLowerCase();
        const univShort = (pt.universitas?.nama_singkat || "").toLowerCase();

        const score = this.computeScore({
          prodiName,
          univName,
          univShort,
          words: queryWords,
          originalQuery,
        });

        if (score > 0) {
          scoredResults.push({ prodi, pt, score });
        }
      }
    }

    // Remove duplicates, keeping highest score
    const dedupMap = new Map<string, { prodi: any; pt: any; score: number }>();
    for (const item of scoredResults) {
      const key = `${item.prodi.prodi_id}-${
        item.pt.universitas?.university_id ?? "x"
      }`;
      const existing = dedupMap.get(key);
      if (!existing || item.score > existing.score) {
        dedupMap.set(key, item);
      }
    }

    // Sort by score descending
    const sorted = [...dedupMap.values()].sort((a, b) => b.score - a.score);

    // Transform and return top results
    return sorted.slice(0, limit).map((item) => ({
      prodi_id: item.prodi.prodi_id.toString(),
      nama_prodi: item.prodi.nama_prodi,
      jenjang: item.prodi.jenjang ?? null,
      akreditasi: item.pt.universitas?.akreditasi || null,
      universitas: item.pt.universitas
        ? {
            university_id: item.pt.universitas.university_id.toString(),
            nama: item.pt.universitas.nama,
            provinsi: item.pt.universitas.provinsi,
          }
        : null,
    }));
  }

  /**
   * Helper: Main search function with normalization
   */
  private async searchProdiLocal(query: string, limit: number = 20) {
    try {
      const normalizedQuery = query.trim().toLowerCase();

      if (normalizedQuery.length === 0) {
        return [];
      }

      const queryWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length >= 2);

      if (queryWords.length === 0) {
        return [];
      }

      return this.intelligentSearch(normalizedQuery, queryWords, limit);
    } catch (error) {
      console.error("Error searching prodi locally:", error);
      throw error;
    }
  }
  // Get all prodi with optional pagination and search
  async getAllProdi(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit,
        search = "",
        jenjang = "",
        akreditasi = "",
      } = req.query as any;

      const hasSearch = search && search.trim().length > 0;
      const hasFilter =
        (jenjang && jenjang !== "Semua") ||
        (akreditasi && akreditasi !== "Semua");

      // Logic:
      // 1. Search with keyword → limit 15
      // 2. Filter only (no search) → no limit (get all matching)
      // 3. No filter, no search → limit 15
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
      if (hasSearch) {
        const searchResults = await this.searchProdiLocal(search.trim(), take);
        return res.json({
          message: "Berhasil mengambil daftar prodi",
          data: searchResults,
          total: searchResults.length,
          page: pageNum,
          limit: take,
        });
      }

      // Get total count first
      const totalCount = await prisma.prodi.count();

      // Fetch prodi with proper limit and offset
      const allProdi = await prisma.prodi.findMany({
        take: take,
        skip: skip,
        include: {
          _count: {
            select: {
              prodi_pt: true,
            },
          },
        },
        orderBy: {
          nama_prodi: "asc",
        },
      });

      const detailedProdi = await Promise.all(
        allProdi.map(async (prodi) => {
          const detailed = await prisma.prodi.findUnique({
            where: { prodi_id: prodi.prodi_id },
            include: {
              prodi_pt: {
                include: {
                  universitas: true,
                },
              },
            },
          });

          if (!detailed) return null;

          return {
            prodi_id: detailed.prodi_id.toString(),
            nama_prodi: detailed.nama_prodi,
            jenjang: detailed.jenjang,
            akreditasi: detailed.prodi_pt[0]?.universitas?.akreditasi || null,
            universitas: detailed.prodi_pt[0]?.universitas
              ? {
                  university_id: detailed.prodi_pt[0].universitas.university_id,
                  nama: detailed.prodi_pt[0].universitas.nama,
                  akreditasi: detailed.prodi_pt[0].universitas.akreditasi,
                  provinsi: detailed.prodi_pt[0].universitas.provinsi,
                  kota: detailed.prodi_pt[0].universitas.kota,
                }
              : null,
          };
        })
      );

      let filteredResults = detailedProdi.filter(
        (p): p is NonNullable<typeof p> => p !== null
      );

      // Apply jenjang filter if specified
      if (jenjang && jenjang !== "Semua") {
        filteredResults = filteredResults.filter((p) => p.jenjang === jenjang);
      }

      // Apply akreditasi filter if specified
      if (akreditasi && akreditasi !== "Semua") {
        filteredResults = filteredResults.filter(
          (p) => p.akreditasi === akreditasi
        );
      }

      res.json({
        message: "Berhasil mengambil daftar prodi",
        data: filteredResults,
        total: totalCount,
        page: pageNum,
        limit: take,
      });
    } catch (e: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil daftar prodi", error: e.message });
    }
  }
  // // API-based endpoints using PDDIKTI
  // async list(req: Request, res: Response) {
  //   try {
  //     const { q, jenjang, bidang, page = "1", limit = "20" } = req.query as any;
  //     const take = Math.min(
  //       Math.max(parseInt(limit as string, 10) || 20, 1),
  //       100
  //     );
  //     const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  //     const skip = (pageNum - 1) * take;

  //     const { data, total } = await pddiktiservice.list({
  //       q: q as string,
  //       jenjang: jenjang as string,
  //       bidang: bidang as string,
  //       skip,
  //       take,
  //     });

  //     res.json({
  //       message: "Berhasil mengambil daftar prodi",
  //       data,
  //       total,
  //       page: pageNum,
  //       limit: take,
  //     });
  //   } catch (e: any) {
  //     res
  //       .status(500)
  //       .json({ message: "Gagal mengambil daftar prodi", error: e.message });
  //   }
  // }

  // async getJenjangList(req: Request, res: Response) {
  //   try {
  //     const data = await pddiktiservice.getJenjangList();
  //     res.json({
  //       message: "Berhasil mengambil daftar jenjang",
  //       data,
  //       total: data.length,
  //     });
  //   } catch (e: any) {
  //     res
  //       .status(500)
  //       .json({ message: "Gagal mengambil daftar jenjang", error: e.message });
  //   }
  // }

  async getProdiById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID prodi harus disediakan" });
      }

      // Use local database with complete relations
      const result = await prisma.prodi.findUnique({
        where: { prodi_id: parseInt(id) },
        include: {
          prodi_pt: {
            include: {
              universitas: true,
            },
          },
        },
      });

      if (!result || !result.prodi_pt || result.prodi_pt.length === 0) {
        return res.status(404).json({ message: "Prodi tidak ditemukan" });
      }

      // Get first university relation (most prodi have one university)
      const firstUniv = result.prodi_pt[0].universitas;

      // Transform to complete format with all university details
      const detailData = {
        prodi_id: result.prodi_id.toString(),
        nama_prodi: result.nama_prodi,
        jenjang: result.jenjang,
        status: "Aktif", // Default status
        kode_prodi: null,
        bidang: null,
        akreditasi: firstUniv?.akreditasi || null,
        akreditasi_internasional: null,
        status_akreditasi: null,
        tanggal_berdiri: null,
        no_tel: firstUniv?.telepon || null,
        no_fax: firstUniv?.fax || null,
        website: null,
        email: firstUniv?.email || null,
        alamat: firstUniv?.alamat || null,
        universitas: {
          university_id: firstUniv?.university_id.toString() || null,
          nama: firstUniv?.nama || null,
          kode_pt: null,
          provinsi: firstUniv?.provinsi || null,
          kab_kota: firstUniv?.kota || null,
          kecamatan: null,
          lintang: null,
          bujur: null,
        },
      };

      res.json({
        message: "Berhasil mengambil detail prodi",
        data: detailData,
        source: "local",
      });
    } catch (e: any) {
      const code = e.message.includes("tidak ditemukan") ? 404 : 500;
      res.status(code).json({ message: e.message });
    }
  }

  async searchProdiByName(req: Request, res: Response) {
    try {
      const { nama } = req.params;
      if (!nama || nama.trim().length === 0) {
        return res.status(400).json({ message: "Nama prodi harus disediakan" });
      }

      // Use local database (from CSV dataset) with limit 15
      const localData = await this.searchProdiLocal(nama, 15);
      res.json({
        message: `Berhasil mencari prodi dengan nama: ${nama} (dataset lokal)`,
        data: localData,
        total: localData.length,
        source: "local",
      });
    } catch (e: any) {
      res
        .status(500)
        .json({ message: "Gagal mencari prodi", error: e.message });
    }
  }
}
