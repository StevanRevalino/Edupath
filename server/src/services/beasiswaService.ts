import { beasiswaRepository } from "../repositories/beasiswaRepository";

interface BeasiswaData {
  title: string;
  image_url: string;
  link: string;
}

export class BeasiswaService {
  private beasiswaRepository = beasiswaRepository;

  // Get all beasiswa
  async getAllBeasiswa() {
    return this.beasiswaRepository.getAllBeasiswa();
  }

  // Get beasiswa by ID
  async getBeasiswaById(id: string) {
    const beasiswa = await this.beasiswaRepository.getBeasiswaById(id);

    if (!beasiswa) {
      throw new Error("Beasiswa not found");
    }

    return beasiswa;
  }

  // Create new beasiswa
  async createBeasiswa(data: BeasiswaData) {
    // Validate required fields
    if (!data.title || !data.image_url || !data.link) {
      throw new Error("Title, image URL, and link are required");
    }

    return this.beasiswaRepository.createBeasiswa(data);
  }

  // Update beasiswa
  async updateBeasiswa(id: string, data: Partial<BeasiswaData>) {
    const beasiswa = await this.beasiswaRepository.updateBeasiswa(id, data);

    if (!beasiswa) {
      throw new Error("Beasiswa not found");
    }

    return beasiswa;
  }

  // Delete beasiswa
  async deleteBeasiswa(id: string) {
    const beasiswa = await this.beasiswaRepository.deleteBeasiswa(id);

    if (!beasiswa) {
      throw new Error("Beasiswa not found");
    }

    return beasiswa;
  }
}
