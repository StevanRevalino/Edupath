import { searchProdi, getProdiDetail } from "../api/pddiktiClient";

export class ProdiService {
  async getProdiById(prodi_id: string): Promise<any> {
    try {
      // Use PDDIKTI API to get prodi details
      const payload = await getProdiDetail(prodi_id);

      // Normalize the response to match expected format
      const prodi = {
        prodi_id: payload?.id_sms,
        nama_prodi: payload?.nama_prodi || "-",
        jenjang: payload?.jenj_didik,
        kode_prodi: payload?.kode_prodi,
        bidang: payload?.kel_bidang,
        akreditasi: payload?.akreditasi,
        akreditasi_internasional: payload?.akreditasi_internasional,
        status_akreditasi: payload?.status_akreditasi,
        status: payload?.status || "Aktif",
        tanggal_berdiri: payload?.tgl_berdiri,
        no_tel: payload?.no_tel,
        no_fax: payload?.no_fax,
        website: payload?.website,
        email: payload?.email,
        alamat: payload?.alamat,
        universitas: {
          university_id: payload?.id_sp,
          nama: payload?.nama_pt,
          kode_pt: payload?.kode_pt?.trim(),
          provinsi: payload?.provinsi,
          kab_kota: payload?.kab_kota,
          kecamatan: payload?.kecamatan,
          lintang: payload?.lintang !== 0 ? payload?.lintang : null,
          bujur: payload?.bujur !== 0 ? payload?.bujur : null,
        },
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
      const mapped = await Promise.all(
        items.map(async (it: any, idx: number) => {
          let akreditasi = null;
          
          // If we have an ID, try to get detailed info including akreditasi
          if (it?.id) {
            try {
              const detailData = await getProdiDetail(it.id);
              akreditasi = detailData?.akreditasi || null;
            } catch (error) {
              // If detail fetch fails, continue without akreditasi
              console.warn(`Failed to fetch detail for prodi ${it.id}:`, error);
            }
          }

          return {
            // Use id as the unique identifier
            prodi_id: it?.id || `prodi_${idx}`,
            nama_prodi: it?.nama || "-",
            jenjang: it?.jenjang,
            akreditasi: akreditasi,
            universitas: {
              nama: it?.pt,
            },
          };
        })
      );

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
