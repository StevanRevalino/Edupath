import { Request, Response } from "express";
import { UniversitasService } from "../services/universitasService";

const universitasService = new UniversitasService();

export class UniversitasController {
  async getUniversitasById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string" || id.trim() === "") {
        return res.status(400).json({
          message: "ID universitas tidak valid",
        });
      }

      const universitas = await universitasService.getUniversitasById(
        id.trim()
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

  async searchUniversitas(req: Request, res: Response) {
    try {
      const { nama } = req.query;

      if (!nama || typeof nama !== "string") {
        return res.status(400).json({
          message: "Parameter nama diperlukan untuk pencarian",
        });
      }

      // TODO: Uncomment when API is ready
      // try {
      //   // Try API first
      //   const universitas = await universitasService.searchUniversitasByName(nama);
      //   res.status(200).json({
      //     message: `Hasil pencarian universitas: "${nama}"`,
      //     data: universitas,
      //     total: universitas.length,
      //     source: "api"
      //   });
      // } catch (apiError) {
      //   console.warn("API failed for universitas search:", apiError);

      // Use local database (from CSV dataset) - but not implemented yet
      res.status(200).json({
        message: `Pencarian universitas: "${nama}" (dataset lokal - belum diimplementasi)`,
        data: [],
        total: 0,
        source: "local",
        note: "Local universitas search akan diimplementasi jika diperlukan",
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
