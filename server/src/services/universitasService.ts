// import { UniversitasRepository } from "../repositories/universitasRepository";
import { searchPerguruanTinggi } from "../api/pddiktiClient";
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

  async getUniversitasById(university_id: number): Promise<any> {
    try {
      // DB access disabled temporarily
      throw new Error(
        "Fitur DB dinonaktifkan. Detail universitas belum tersedia dari API eksternal"
      );
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
        // PDDIKTI search likely has an id field; fallback to index if missing
        university_id: it?.id_pt || it?.id || idx,
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
    university_id: number,
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
