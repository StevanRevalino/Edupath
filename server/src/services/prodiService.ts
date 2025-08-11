import { ProdiRepository, ProdiFilter } from "../repositories/prodiRepository";

const repo = new ProdiRepository();

export class ProdiService {
  async list(filter: ProdiFilter) {
    const [data, total] = await Promise.all([
      repo.findMany(filter),
      repo.count(filter),
    ]);
    return { data, total };
  }

  async getById(prodi_id: number) {
    const prodi = await repo.findById(prodi_id);
    if (!prodi) throw new Error("Prodi tidak ditemukan");
    return prodi;
  }

  async getUniversitas(prodi_id: number) {
    return repo.findUniversitasByProdi(prodi_id);
  }

  async getJenjangList() {
    return repo.getJenjangList();
  }
}
