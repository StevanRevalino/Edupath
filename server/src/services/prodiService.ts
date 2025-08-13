import { searchProdi, getProdiDetail } from "../api/pddiktiClient";

export class ProdiService {
  async getProdiById(prodi_id: string): Promise<any> {
    try {
      // Use PDDIKTI API to get prodi details
      const payload = await getProdiDetail(prodi_id);

      // Normalize the response to match expected format
      const prodi = {
        prodi_id: payload?.id_prodi || prodi_id,
        nama_prodi: payload?.nama_prodi || payload?.nm_lemb || "-",
        jenjang: payload?.jenjang || payload?.nm_jenj_didik || null,
        kode_prodi: payload?.kode_prodi || null,
        bidang: payload?.bidang || payload?.nm_klmpk_bidang || null,
        akreditasi: payload?.akreditasi || payload?.akred_sp || null,
        status_akreditasi: payload?.status_akreditasi || null,
        tanggal_berdiri: payload?.tgl_berdiri || null,
        tanggal_tutup: payload?.tgl_tutup || null,
        status: payload?.stat_prodi || payload?.status || "Aktif",
        gelar: payload?.gelar || null,
        singkatan_gelar: payload?.singkatan_gelar || null,
        deskripsi: payload?.deskripsi || null,
      };

      return prodi;
    } catch (error: any) {
      throw new Error(`Gagal mengambil data prodi: ${error.message}`);
    }
  }

  async searchProdiByName(nama: string): Promise<any[]> {
    try {
      // Fetch from external PDDIKTI API
      const payload = await searchProdi(nama);
      // The API may return an array or an object with fields; try to normalize
      const items: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      // Map to a minimal shape the UI expects
      const mapped = items.map((it: any, idx: number) => ({
        // Use PDDIKTI's id_prodi as the unique identifier
        prodi_id: it?.id_prodi || it?.id || `prodi_${idx}`,
        nama_prodi: it?.nama_prodi || it?.nama || it?.nm_lemb || "-",
        jenjang:
          it?.jenjang || it?.nm_jenj_didik || it?.jenjang_pendidikan || null,
        kode_prodi: it?.kode_prodi || it?.kode || null,
        bidang:
          it?.bidang || it?.nm_klmpk_bidang || it?.kelompok_bidang || null,
        akreditasi: it?.akreditasi || it?.akred_sp || null,
        status: it?.stat_prodi || it?.status || "Aktif",
        gelar: it?.gelar || null,
        universitas: {
          university_id: it?.id_pt || it?.id_perguruan_tinggi || null,
          nama: it?.nama_pt || it?.perguruan_tinggi || it?.pt || null,
          provinsi: it?.provinsi_pt || it?.provinsi || null,
        },
      }));

      return mapped;
    } catch (error: any) {
      throw new Error(`Gagal mencari prodi: ${error.message}`);
    }
  }

  async searchProdiByCombination(params: {
    nama?: string;
    jenjang?: string;
    bidang?: string;
  }): Promise<any[]> {
    try {
      let results: any[] = [];

      // If name is provided, use that as the primary search
      if (params.nama) {
        results = await this.searchProdiByName(params.nama);
      } else {
        // If no name, try to get results using broad search terms
        const searchTerms = [];
        if (params.bidang) searchTerms.push(params.bidang);
        if (params.jenjang) searchTerms.push(params.jenjang);

        if (searchTerms.length === 0) {
          throw new Error("Minimal satu kriteria pencarian harus disediakan");
        }

        // Use the first available term for search
        results = await this.searchProdiByName(searchTerms[0]);
      }

      // Filter by jenjang if provided
      if (params.jenjang) {
        results = results.filter(
          (prodi) =>
            prodi.jenjang &&
            prodi.jenjang.toLowerCase().includes(params.jenjang!.toLowerCase())
        );
      }

      // Filter by bidang if provided
      if (params.bidang) {
        results = results.filter(
          (prodi) =>
            prodi.bidang &&
            prodi.bidang.toLowerCase().includes(params.bidang!.toLowerCase())
        );
      }

      return results;
    } catch (error: any) {
      throw new Error(`Gagal mencari prodi: ${error.message}`);
    }
  }

  // Legacy method for backward compatibility - now uses API search
  async list(filter: {
    q?: string;
    jenjang?: string;
    bidang?: string;
    skip?: number;
    take?: number;
  }) {
    try {
      let results: any[] = [];

      // Use search by name if query is provided
      if (filter.q) {
        results = await this.searchProdiByName(filter.q);
      } else {
        // Use combination search for other filters
        results = await this.searchProdiByCombination({
          nama: filter.q,
          jenjang: filter.jenjang,
          bidang: filter.bidang,
        });
      }

      // Apply pagination
      const skip = filter.skip || 0;
      const take = filter.take || 20;
      const paginatedResults = results.slice(skip, skip + take);

      return {
        data: paginatedResults,
        total: results.length,
      };
    } catch (error: any) {
      throw new Error(`Gagal mengambil daftar prodi: ${error.message}`);
    }
  }

  // Return simplified jenjang list
  async getJenjangList() {
    // Return only S1, D3, D4 as requested
    return ["S1", "D3", "D4"];
  }
}
