import { UniversitasRepository } from "../repositories/universitasRepository";

const universitasRepository = new UniversitasRepository();

export class UniversitasService {
  async getAllUniversitas() {
    try {
      const universitas = await universitasRepository.findAll();
      return universitas;
    } catch (error: any) {
      throw new Error(`Gagal mengambil data universitas: ${error.message}`);
    }
  }

  async getUniversitasById(university_id: number) {
    try {
      const universitas = await universitasRepository.findById(university_id);
      if (!universitas) {
        throw new Error("Universitas tidak ditemukan");
      }
      return universitas;
    } catch (error: any) {
      throw new Error(`Gagal mengambil data universitas: ${error.message}`);
    }
  }

  async getUniversitasByProvinsi(provinsi: string) {
    try {
      const universitas = await universitasRepository.findByProvinsi(provinsi);
      return universitas;
    } catch (error: any) {
      throw new Error(
        `Gagal mengambil data universitas berdasarkan provinsi: ${error.message}`
      );
    }
  }

  async getUniversitasByAkreditasi(akreditasi: string) {
    try {
      const universitas = await universitasRepository.findByAkreditasi(
        akreditasi
      );
      return universitas;
    } catch (error: any) {
      throw new Error(
        `Gagal mengambil data universitas berdasarkan akreditasi: ${error.message}`
      );
    }
  }

  async searchUniversitasByName(nama: string) {
    try {
      const universitas = await universitasRepository.searchByName(nama);
      return universitas;
    } catch (error: any) {
      throw new Error(`Gagal mencari universitas: ${error.message}`);
    }
  }

  async getProvinsiList() {
    try {
      const provinsiList = await universitasRepository.getProvinsiList();
      return provinsiList;
    } catch (error: any) {
      throw new Error(`Gagal mengambil daftar provinsi: ${error.message}`);
    }
  }

  async getAkreditasiList() {
    try {
      const akreditasiList = await universitasRepository.getAkreditasiList();
      return akreditasiList;
    } catch (error: any) {
      throw new Error(`Gagal mengambil daftar akreditasi: ${error.message}`);
    }
  }
}
