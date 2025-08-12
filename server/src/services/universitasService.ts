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
        nama_singkat: payload?.singkatan || payload?.nama_singkat || null,
        kota: payload?.kota || payload?.alamat_kota || null,
        provinsi:
          payload?.provinsi || payload?.propinsi || payload?.wilayah || null,
        akreditasi: payload?.akreditasi || payload?.akreditasi_pt || null,
        status: payload?.status || payload?.status_pt || null,
        rank_qs: payload?.rank_qs || null,
        rank_country: payload?.rank_country || null,
        email: payload?.email || null,
        telepon: payload?.telepon || payload?.no_telp || payload?.phone || null,
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
        nama_singkat: it?.singkatan || it?.nama_singkat || null,
        provinsi: it?.provinsi || it?.propinsi || it?.wilayah || null,
        akreditasi: it?.akreditasi || it?.akreditasi_pt || null,
        status: it?.status || it?.status_pt || null,
        rank_qs: null,
        rank_country: null,
        email: it?.email || null,
        telepon: it?.telepon || it?.no_telp || null,
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
