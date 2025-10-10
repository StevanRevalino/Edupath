import { ProdiRepository } from "../repositories/prodiRepository";

export class ProdiService {
  private prodiRepository: ProdiRepository;

  constructor() {
    this.prodiRepository = new ProdiRepository();
  }

  // Get all prodi with optional search and pagination
  async getAllProdiLocal({
    search = "",
    skip = 0,
    take = 50,
  }: {
    search?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      if (search && search.trim().length > 0) {
        const searchResults = await this.searchProdiLocal(search.trim(), take);
        return {
          data: searchResults,
          total: searchResults.length,
        };
      }

      // Get total count first
      const totalCount = await this.prodiRepository.count();

      // Fetch prodi with proper limit and offset
      const allProdi = await this.prodiRepository.findMany({
        limit: take,
        offset: skip,
      });

      const detailedProdi = await Promise.all(
        allProdi.map(async (prodi) => {
          const detailed = await this.prodiRepository.findById(prodi.prodi_id);
          if (!detailed) return null;

          return {
            prodi_id: detailed.prodi_id.toString(),
            nama_prodi: detailed.nama_prodi,
            jenjang: detailed.jenjang,
            kode_prodi: null,
            bidang: null,
            akreditasi:
              detailed.prodi_pt[0]?.akreditasi_prodi ||
              detailed.prodi_pt[0]?.universitas?.akreditasi ||
              null,
            status_akreditasi:
              detailed.prodi_pt[0]?.akreditasi_prodi ||
              detailed.prodi_pt[0]?.universitas?.akreditasi ||
              null,
            tanggal_berdiri: null,
            tanggal_tutup: null,
            status: "Aktif",
            gelar: null,
            singkatan_gelar: null,
            deskripsi: null,
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

      const filteredResults = detailedProdi.filter(Boolean);

      return {
        data: filteredResults,
        total: totalCount,
      };
    } catch (error) {
      console.error("Error getting all prodi locally:", error);
      throw error;
    }
  }

  async getProdiDetailLocal(prodiId: string) {
    try {
      const result = await this.prodiRepository.findById(parseInt(prodiId));

      if (!result) {
        return null;
      }

      const transformedResult = {
        prodi_id: result.prodi_id.toString(),
        nama_prodi: result.nama_prodi,
        jenjang: result.jenjang,
        kode_prodi: null,
        bidang: null,
        akreditasi:
          result.prodi_pt[0]?.akreditasi_prodi ||
          result.prodi_pt[0]?.universitas?.akreditasi ||
          null,
        status_akreditasi:
          result.prodi_pt[0]?.akreditasi_prodi ||
          result.prodi_pt[0]?.universitas?.akreditasi ||
          null,
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

  // Main search function
  async searchProdiLocal(query: string, limit: number = 20) {
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

  // Helper: Create acronym from string
  private makeAcronym(s: string): string {
    return s
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toLowerCase();
  }

  // Helper: Normalize university name variations
  private normalizeUnivName(name: string): string {
    return name
      .toLowerCase()
      .replace(/^universitas\s+/i, "")
      .replace(/^institut\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Helper: Check if words are in sequence
  private hasSequentialMatch(text: string, words: string[]): boolean {
    if (words.length === 0) return false;

    const pattern = words.join("\\s+");
    const regex = new RegExp(pattern, "i");
    return regex.test(text);
  }

  // Main scoring algorithm
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

  // Intelligent search combining all strategies
  private async intelligentSearch(
    originalQuery: string,
    queryWords: string[],
    limit: number
  ) {
    const allProdi = await this.prodiRepository.findMany({ limit: 2000 });
    const allResults = await Promise.all(
      allProdi.map(async (prodi) =>
        this.prodiRepository.findById(prodi.prodi_id)
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
      kode_prodi: null,
      bidang: null,
      akreditasi:
        item.pt.akreditasi_prodi || item.pt.universitas?.akreditasi || null,
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
  }
}
