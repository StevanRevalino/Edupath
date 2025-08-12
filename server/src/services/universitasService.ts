// import { UniversitasRepository } from "../repositories/universitasRepository";
import {
  searchPerguruanTinggi,
  getPerguruanTinggiDetail,
} from "../api/pddiktiClient";
// const universitasRepository = new UniversitasRepository();

export class UniversitasService {
  async getAllUniversitas(): Promise<any[]> {
    try {
      // DB access disabled temporarily; use external search endpoint instead
      throw new Error(
        "Fitur DB dinonaktifkan. Gunakan endpoint /api/universitas/search/nama"
      );
    } catch (error: any) {
      throw new Error(`Gagal mengambil data universitas: ${error.message}`);
    }
  }

  async getUniversitasById(university_id: string): Promise<any> {
    try {
      // Use PDDIKTI API to get university details
      const payload = await getPerguruanTinggiDetail(university_id);

      // Normalize the response to match expected format
      const universitas = {
        university_id: payload?.id_pt || university_id,
        nama: payload?.nama_pt || payload?.nama || "-",
        nama_singkat: payload?.nm_singkat || payload?.nama_singkat || null,
        npsn: payload?.npsn || null,
        kota:
          payload?.kab_kota_pt || payload?.kota || payload?.alamat_kota || null,
        provinsi:
          payload?.provinsi_pt ||
          payload?.provinsi ||
          payload?.propinsi ||
          payload?.wilayah ||
          null,
        alamat: payload?.alamat || payload?.alamat_pt || null,
        kode_pos: payload?.kode_pos || null,
        akreditasi: payload?.akreditasi_pt || payload?.akreditasi || null,
        status: payload?.status_pt || payload?.status || null,
        rank_qs: payload?.rank_qs || null,
        rank_country: payload?.rank_country || null,
        email: payload?.email || null,
        telepon:
          payload?.no_tel ||
          payload?.telepon ||
          payload?.no_telp ||
          payload?.phone ||
          null,
        fax: payload?.no_fax || payload?.fax || null,
        website: payload?.website || payload?.situs || payload?.url || null,
        tanggal_berdiri:
          payload?.tgl_berdiri_pt ||
          payload?.tanggal_berdiri ||
          payload?.tgl_berdiri ||
          null,
        sk_pendirian:
          payload?.sk_pendirian_sp ||
          payload?.sk_pendirian ||
          payload?.nomor_sk ||
          null,
        jumlah_mahasiswa:
          payload?.jumlah_mahasiswa || payload?.jml_mahasiswa || null,
        jumlah_dosen: payload?.jumlah_dosen || payload?.jml_dosen || null,
        kecamatan: payload?.kecamatan_pt || null,
        lintang: payload?.lintang_pt || null,
        bujur: payload?.bujur_pt || null,
        tanggal_sk: payload?.tgl_sk_pendirian_sp || null,
        status_akreditasi: payload?.status_akreditasi || null,
      };

      return universitas;
    } catch (error: any) {
      throw new Error(`Gagal mengambil data universitas: ${error.message}`);
    }
  }

  async getUniversitasByProvinsi(provinsi: string): Promise<any[]> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Filter provinsi belum tersedia dari API eksternal"
      );
    } catch (error: any) {
      throw new Error(
        `Gagal mengambil data universitas berdasarkan provinsi: ${error.message}`
      );
    }
  }

  async getUniversitasByAkreditasi(akreditasi: string): Promise<any[]> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Filter akreditasi belum tersedia dari API eksternal"
      );
    } catch (error: any) {
      throw new Error(
        `Gagal mengambil data universitas berdasarkan akreditasi: ${error.message}`
      );
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

      // Map to a minimal shape the UI expects
      const mapped = items.map((it: any, idx: number) => ({
        // Use PDDIKTI's id_pt as the unique identifier
        university_id: it?.id_pt || it?.id || `pt_${idx}`,
        nama: it?.nama_pt || it?.nama || "-",
        nama_singkat:
          it?.nm_singkat || it?.singkatan || it?.nama_singkat || null,
        provinsi:
          it?.provinsi_pt ||
          it?.provinsi ||
          it?.propinsi ||
          it?.wilayah ||
          null,
        akreditasi: it?.akreditasi_pt || it?.akreditasi || null,
        status: it?.status_pt || it?.status || null,
        rank_qs: null,
        rank_country: null,
        email: it?.email || null,
        telepon: it?.no_tel || it?.telepon || it?.no_telp || null,
      }));

      return mapped;
    } catch (error: any) {
      throw new Error(`Gagal mencari universitas: ${error.message}`);
    }
  }

  async getProvinsiList(): Promise<string[]> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Daftar provinsi belum tersedia dari API eksternal"
      );
    } catch (error: any) {
      throw new Error(`Gagal mengambil daftar provinsi: ${error.message}`);
    }
  }

  async getAkreditasiList(): Promise<string[]> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Daftar akreditasi belum tersedia dari API eksternal"
      );
    } catch (error: any) {
      throw new Error(`Gagal mengambil daftar akreditasi: ${error.message}`);
    }
  }

  async getProdiByUniversitas(
    university_id: string,
    filter: { q?: string; jenjang?: string; skip?: number; take?: number }
  ): Promise<{ data: any[]; total: number }> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Prodi per universitas belum tersedia dari API eksternal"
      );
    } catch (error: any) {
      throw new Error(`Gagal mengambil prodi di universitas: ${error.message}`);
    }
  }
}
