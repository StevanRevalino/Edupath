import { Request, Response } from "express";
import { ProdiPddiktiService } from "../services/prodiPddiktiService";
import { ProdiService } from "../services/prodiService";

export class ProdiController {
  private pddiktiService: ProdiPddiktiService;
  private localService: ProdiService;

  constructor() {
    this.pddiktiService = new ProdiPddiktiService();
    this.localService = new ProdiService();
  }
  // Get all prodi with optional pagination and search
  async getAllProdi(req: Request, res: Response) {
    try {
      const { page = "1", limit = "50", search = "" } = req.query as any;
      const take = Math.min(
        Math.max(parseInt(limit as string, 10) || 50, 1),
        1000
      );
      const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
      const skip = (pageNum - 1) * take;

      const { data, total } = await this.localService.getAllProdiLocal({
        search: search as string,
        skip,
        take,
      });

      res.json({
        message: "Berhasil mengambil daftar prodi",
        data,
        total,
        page: pageNum,
        limit: take,
      });
    } catch (e: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil daftar prodi", error: e.message });
    }
  }
  // // API-based endpoints using PDDIKTI
  // async list(req: Request, res: Response) {
  //   try {
  //     const { q, jenjang, bidang, page = "1", limit = "20" } = req.query as any;
  //     const take = Math.min(
  //       Math.max(parseInt(limit as string, 10) || 20, 1),
  //       100
  //     );
  //     const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
  //     const skip = (pageNum - 1) * take;

  //     const { data, total } = await pddiktiservice.list({
  //       q: q as string,
  //       jenjang: jenjang as string,
  //       bidang: bidang as string,
  //       skip,
  //       take,
  //     });

  //     res.json({
  //       message: "Berhasil mengambil daftar prodi",
  //       data,
  //       total,
  //       page: pageNum,
  //       limit: take,
  //     });
  //   } catch (e: any) {
  //     res
  //       .status(500)
  //       .json({ message: "Gagal mengambil daftar prodi", error: e.message });
  //   }
  // }

  // async getJenjangList(req: Request, res: Response) {
  //   try {
  //     const data = await pddiktiservice.getJenjangList();
  //     res.json({
  //       message: "Berhasil mengambil daftar jenjang",
  //       data,
  //       total: data.length,
  //     });
  //   } catch (e: any) {
  //     res
  //       .status(500)
  //       .json({ message: "Gagal mengambil daftar jenjang", error: e.message });
  //   }
  // }

  async getProdiById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID prodi harus disediakan" });
      }

      // Use local database (from CSV dataset)
      const localProdi = await this.localService.getProdiDetailLocal(id);
      if (localProdi) {
        res.json({
          message: "Berhasil mengambil detail prodi (dataset lokal)",
          data: localProdi,
          source: "local",
        });
      } else {
        throw new Error("Prodi tidak ditemukan");
      }
      // }
    } catch (e: any) {
      const code = e.message.includes("tidak ditemukan") ? 404 : 500;
      res.status(code).json({ message: e.message });
    }
  }

  async searchProdiByName(req: Request, res: Response) {
    try {
      const { nama } = req.params;
      if (!nama || nama.trim().length === 0) {
        return res.status(400).json({ message: "Nama prodi harus disediakan" });
      }

      // Use local database (from CSV dataset) with limit 15
      const localData = await this.localService.searchProdiLocal(nama, 15);
      res.json({
        message: `Berhasil mencari prodi dengan nama: ${nama} (dataset lokal)`,
        data: localData,
        total: localData.length,
        source: "local",
      });
      // }
    } catch (e: any) {
      res
        .status(500)
        .json({ message: "Gagal mencari prodi", error: e.message });
    }
  }
}
