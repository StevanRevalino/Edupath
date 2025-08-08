import { Request, Response } from "express";
import { UniversitasService } from "../services/universitasService";

const universitasService = new UniversitasService();

export class UniversitasController {
  async getAllUniversitas(req: Request, res: Response) {
    try {
      const universitas = await universitasService.getAllUniversitas();
      res.status(200).json({
        message: "Berhasil mengambil data universitas",
        data: universitas,
        total: universitas.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mengambil data universitas",
        error: error.message,
      });
    }
  }

  async getUniversitasById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const university_id = parseInt(id, 10);

      if (isNaN(university_id)) {
        return res.status(400).json({
          message: "ID universitas tidak valid",
        });
      }

      const universitas = await universitasService.getUniversitasById(
        university_id
      );
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

  async getUniversitasByProvinsi(req: Request, res: Response) {
    try {
      const { provinsi } = req.query;

      if (!provinsi || typeof provinsi !== "string") {
        return res.status(400).json({
          message: "Parameter provinsi diperlukan",
        });
      }

      const universitas = await universitasService.getUniversitasByProvinsi(
        provinsi
      );
      res.status(200).json({
        message: `Berhasil mengambil data universitas di ${provinsi}`,
        data: universitas,
        total: universitas.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mengambil data universitas berdasarkan provinsi",
        error: error.message,
      });
    }
  }

  async getUniversitasByAkreditasi(req: Request, res: Response) {
    try {
      const { akreditasi } = req.query;

      if (!akreditasi || typeof akreditasi !== "string") {
        return res.status(400).json({
          message: "Parameter akreditasi diperlukan",
        });
      }

      const universitas = await universitasService.getUniversitasByAkreditasi(
        akreditasi
      );
      res.status(200).json({
        message: `Berhasil mengambil data universitas dengan akreditasi ${akreditasi}`,
        data: universitas,
        total: universitas.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mengambil data universitas berdasarkan akreditasi",
        error: error.message,
      });
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

      const universitas = await universitasService.searchUniversitasByName(
        nama
      );
      res.status(200).json({
        message: `Hasil pencarian universitas: "${nama}"`,
        data: universitas,
        total: universitas.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mencari universitas",
        error: error.message,
      });
    }
  }

  async getProvinsiList(req: Request, res: Response) {
    try {
      const provinsiList = await universitasService.getProvinsiList();
      res.status(200).json({
        message: "Berhasil mengambil daftar provinsi",
        data: provinsiList,
        total: provinsiList.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mengambil daftar provinsi",
        error: error.message,
      });
    }
  }

  async getAkreditasiList(req: Request, res: Response) {
    try {
      const akreditasiList = await universitasService.getAkreditasiList();
      res.status(200).json({
        message: "Berhasil mengambil daftar akreditasi",
        data: akreditasiList,
        total: akreditasiList.length,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Gagal mengambil daftar akreditasi",
        error: error.message,
      });
    }
  }
}
