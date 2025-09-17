// import { UniversitasRepository } from "../repositories/universitasRepository";
import {
  searchPerguruanTinggi,
  getPerguruanTinggiDetail,
} from "../api/pddiktiClient";
// const universitasRepository = new UniversitasRepository();

export class UniversitasPddiktiService {

  async getUniversitasById(university_id: string): Promise<any> {
    try {
      // Use PDDIKTI API to get university details
      const payload = await getPerguruanTinggiDetail(university_id);

      // Normalize the response to match expected format
      const universitas = {
        university_id: payload?.id_pt || university_id,
        nama: payload?.nama_pt || "-",
        nama_singkat: payload?.nm_singkat || null,
        kelompok: payload?.kelompok || null,
        pembina: payload?.pembina || null,
        alamat: payload?.alamat || null,
        kecamatan: payload?.kecamatan_pt || null,
        kota: payload?.kab_kota_pt || null,
        provinsi: payload?.provinsi_pt || null,
        kode_pos: payload?.kode_pos || null,
        lintang: payload?.lintang_pt || null,
        bujur: payload?.bujur_pt || null,
        email: payload?.email || null,
        telepon: payload?.no_tel || null,
        fax: payload?.no_fax || null,
        website: payload?.website || null,
        tanggal_berdiri: payload?.tgl_berdiri_pt || null,
        akreditasi: payload?.akreditasi_pt || null,
        status_akreditasi: payload?.status_akreditasi || null,
        rank_qs: payload?.rank_qs || null,
        rank_country: payload?.rank_country || null,
      };

      return universitas;
    } catch (error: any) {
      throw new Error(`Gagal mengambil data universitas: ${error.message}`);
    }
  }

  async searchUniversitasByName(nama: string): Promise<any[]> {
    try {
      // Fetch from external PDDIKTI API instead of DB
      const payload = await searchPerguruanTinggi(nama);
      // The API may return an array or an object with fields; try to normalize
      const items: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      // Map to a minimal shape with akreditasi from detail API
      const mapped = await Promise.all(
        items.map(async (it: any, idx: number) => {
          let detailData = null;

          // If we have an ID, get full details including akreditasi
          if (it?.id) {
            try {
              detailData = await getPerguruanTinggiDetail(it.id);
            } catch (error) {
              // If detail fetch fails, continue without detail data
              console.warn(`Failed to fetch detail for university ${it.id}`);
            }
          }

          return {
            university_id: it?.id,
            nama: it?.nama || detailData?.nama_pt || "-",
            nama_singkat: it?.nama_singkat  || null,
            kota: detailData?.kab_kota_pt || null,
            provinsi: detailData?.provinsi_pt || null,
            akreditasi: detailData?.akreditasi_pt || null,
            email: detailData?.email || null,
            telepon: detailData?.no_tel || null,
          };
        })
      );

      return mapped;
    } catch (error: any) {
      throw new Error(`Gagal mencari universitas: ${error.message}`);
    }
  }
}
