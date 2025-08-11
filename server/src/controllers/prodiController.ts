import { Request, Response } from "express";
import { ProdiService } from "../services/prodiService";

const service = new ProdiService();

export class ProdiController {
  async list(req: Request, res: Response) {
    try {
      const { q, jenjang, bidang, page = "1", limit = "20" } = req.query as any;
      const take = Math.min(
        Math.max(parseInt(limit as string, 10) || 20, 1),
        100
      );
      const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
      const skip = (pageNum - 1) * take;

      const { data, total } = await service.list({
        q: q as string,
        jenjang: jenjang as string,
        bidang: bidang as string,
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

  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id))
        return res.status(400).json({ message: "ID prodi tidak valid" });
      const prodi = await service.getById(id);
      res.json({ message: "Berhasil mengambil detail prodi", data: prodi });
    } catch (e: any) {
      const code = e.message.includes("tidak ditemukan") ? 404 : 500;
      res.status(code).json({ message: e.message });
    }
  }

  async getUniversitas(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id))
        return res.status(400).json({ message: "ID prodi tidak valid" });
      const rows = await service.getUniversitas(id);
      res.json({
        message: "Berhasil mengambil universitas untuk prodi",
        data: rows,
        total: rows.length,
      });
    } catch (e: any) {
      res
        .status(500)
        .json({
          message: "Gagal mengambil universitas untuk prodi",
          error: e.message,
        });
    }
  }

  async getJenjangList(req: Request, res: Response) {
    try {
      const data = await service.getJenjangList();
      res.json({
        message: "Berhasil mengambil daftar jenjang",
        data,
        total: data.length,
      });
    } catch (e: any) {
      res
        .status(500)
        .json({ message: "Gagal mengambil daftar jenjang", error: e.message });
    }
  }
}
