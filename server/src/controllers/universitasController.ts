import { Request, Response } from "express";
import { UniversitasPddiktiService } from "../services/universitasPddiktiService";
import { UniversitasService } from "../services/universitasService";

export class UniversitasController {
  private universitasService: UniversitasPddiktiService;
  private localService: UniversitasService;

  constructor() {
    this.universitasService = new UniversitasPddiktiService();
    this.localService = new UniversitasService();
  }
  // Get all universitas with optional pagination and search
  async getAllUniversitas(req: Request, res: Response) {
    try {
      const { page = "1", limit = "50", search = "" } = req.query as any;
      const take = Math.min(
        Math.max(parseInt(limit as string, 10) || 50, 1),
        1000
      );
      const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
      const skip = (pageNum - 1) * take;

      const { data, total } = await this.localService.getAllUniversitasLocal({
        search: search as string,
        skip,
        take,
      });

      res.json({
        message: "Berhasil mengambil daftar universitas",
        data,
        total,
        page: pageNum,
        limit: take,
      });
    } catch (e: any) {
      res.status(500).json({
        message: "Gagal mengambil daftar universitas",
        error: e.message,
      });
    }
  }
  async getUniversitasById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({
          message: "ID universitas tidak valid",
        });
      }

      // Use local data service instead of external API
      const universitas = await this.localService.getUniversitasById(id.trim());
      res.status(200).json({
        message: "Berhasil mengambil data universitas",
        data: universitas,
      });
    } catch (error: any) {
      if (error.message.includes("tidak ditemukan")) {
        res.status(404).json({
          message: error.message,
        });
      } else {
        res.status(500).json({
          message: "Gagal mengambil data universitas",
          error: error.message,
        });
      }
    }
  }

  async searchUniversitas(req: Request, res: Response) {
    try {
      const { nama } = req.query;

      if (!nama || typeof nama !== "string") {
        return res.status(400).json({
          message: "Parameter nama diperlukan untuk pencarian",
        });
      }

      if (nama.trim().length < 2) {
        return res.status(400).json({
          message: "Nama universitas harus minimal 2 karakter",
        });
      }

      // Use local database (from CSV dataset) with smart search
      const localData = await this.localService.searchUniversitasLocal(
        nama.trim(),
        15
      );
      res.status(200).json({
        message: `Berhasil mencari universitas dengan nama: ${nama.trim()} (dataset lokal)`,
        data: localData,
        total: localData.length,
        source: "local",
      });
      // }
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mencari universitas",
        error: error.message,
      });
    }
  }
}
