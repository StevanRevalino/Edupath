import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const prisma = new PrismaClient();

async function loadCSV(filePath: string) {
  return new Promise<any[]>((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function main() {
  // === UNIVERSITAS ===
  const universitasCSV = await loadCSV(path.join(__dirname, "../../dataset/universitas.csv"));
  await prisma.universitas.deleteMany();
  await prisma.universitas.createMany({
    data: universitasCSV.map((u) => ({
      university_id: parseInt(u.university_id, 10),
      nama: u.nama || null,
      npsn: u.npsn || null,
      nama_singkat: u.nama_singkat || null,
      kode_pos: u.kode_pos || null,
      telepon: u.telepon || null,
      fax: u.fax || null,
      email: u.email || null,
      alamat: u.alamat || null,
      kota: u.kota || null,
      provinsi: u.provinsi || null,
      akreditasi: u.akreditasi || null,
      status: u.status || null,
      rank_qs: u.rank_qs ? parseFloat(u.rank_qs) : null,
      rank_country: u.rank_country ? parseInt(u.rank_country, 10) : null,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Universitas: ${universitasCSV.length} data diimport`);

  // === PRODI ===
  const prodiCSV = await loadCSV(path.join(__dirname, "../../dataset/prodi.csv"));
  await prisma.prodi.deleteMany();
  await prisma.prodi.createMany({
    data: prodiCSV.map((p) => ({
      prodi_id: parseInt(p.prodi_id, 10),
      nama_prodi: p.nama_prodi || null,
      jenjang: p.jenjang || null,
      bidang: p.bidang || null,
      keywords: p.keywords || null,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ Prodi: ${prodiCSV.length} data diimport`);

  // === PRODI PT ===
  const prodiPTCSV = await loadCSV(path.join(__dirname, "../../dataset/prodi_pt.csv"));
  await prisma.prodiPT.deleteMany();
  await prisma.prodiPT.createMany({
    data: prodiPTCSV.map((pp) => ({
      prodi_id: parseInt(pp.prodi_id, 10),
      university_id: parseInt(pp.university_id, 10),
      akreditasi_prodi: pp.akreditasi_prodi || null,
      ukt_min: pp.ukt_min ? parseInt(pp.ukt_min, 10) : null,
      ukt_max: pp.ukt_max ? parseInt(pp.ukt_max, 10) : null,
      link_prodi: pp.link_prodi || null,
    })),
    skipDuplicates: true,
  });
  console.log(`✅ ProdiPT: ${prodiPTCSV.length} data diimport`);

  console.log("🎉 Semua data berhasil di-seed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
