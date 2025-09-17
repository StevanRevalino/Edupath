import { ProdiRepository } from "../repositories/prodiRepository";

const prodiRepository = new ProdiRepository();

export class ProdiService {
  async getProdiDetailLocal(prodiId: string) {
    try {
      const result = await prodiRepository.findById(parseInt(prodiId));

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
    const prodiNameResults = await prodiRepository.findMany({
      nama_prodi: query,
      limit: 1000, // Get more results for processing
    });

    // Get the detailed results with relations
    const prodiNameResultsWithRelations = await Promise.all(
      prodiNameResults.map(async (prodi) => {
        return await prodiRepository.findById(prodi.prodi_id);
      })
    );

    // Then, search by university name (lower priority)
    // Since ProdiRepository doesn't have direct university search,
    // we'll get all prodi and filter by university
    const allProdiWithUniversities = await Promise.all(
      (
        await prodiRepository.findMany({ limit: 1000 })
      ).map(async (prodi) => {
        return await prodiRepository.findById(prodi.prodi_id);
      })
    );

    const universityNameResults = allProdiWithUniversities.filter((prodi) => {
      if (!prodi?.prodi_pt) return false;
      return prodi.prodi_pt.some((pt) => {
        const univName = pt.universitas?.nama?.toLowerCase() || "";
        const univShortName = pt.universitas?.nama_singkat?.toLowerCase() || "";
        return (
          univName.includes(query.toLowerCase()) ||
          univShortName.includes(query.toLowerCase())
        );
      });
    });

    // Combine results, prioritizing prodi name matches
    const combinedResults = [...prodiNameResultsWithRelations.filter(Boolean)];

    // Add university name results that aren't already included
    for (const univResult of universityNameResults) {
      if (!univResult) continue;

      const alreadyExists = combinedResults.some(
        (existing) => existing && existing.prodi_id === univResult.prodi_id
      );
      if (!alreadyExists) {
        combinedResults.push(univResult);
      }
    }

    return this.transformResults(combinedResults, limit);
  }

  // Multi-word search with intelligent matching
  private async multiWordSearch(queryWords: string[], limit: number) {
    // Get all potential matches from repository
    const allProdi = await prodiRepository.findMany({ limit: 2000 });

    // Get detailed results with relations
    const allResults = await Promise.all(
      allProdi.map(async (prodi) => {
        return await prodiRepository.findById(prodi.prodi_id);
      })
    );

    // Score and filter results
    const scoredResults = [];

    for (const prodi of allResults) {
      if (!prodi || !prodi.prodi_pt) continue;

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
}
