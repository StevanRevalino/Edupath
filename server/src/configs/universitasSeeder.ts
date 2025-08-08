import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";

const prisma = new PrismaClient();

interface UniversitasCSV {
  no: string;
  nama: string;
  npsn: string;
  "nama singkat": string;
  kode_pos: string;
  telepon: string;
  fax: string;
  email: string;
  alamat: string;
  kota: string;
  provinsi: string;
  Negara: string;
  lintang: string;
  bujur: string;
  akreditasi: string;
  "Status ": string;
  rank_qs: string;
  rank_country: string;
}

export async function cleanNullAkreditasiUniversitas() {
  console.log("🧹 Membersihkan universitas dengan akreditasi NULL...");

  const deletedCount = await prisma.universitas.deleteMany({
    where: {
      OR: [{ akreditasi: "NULL" }, { akreditasi: "" }],
    },
  });

  console.log(
    `✅ Berhasil menghapus ${deletedCount.count} universitas dengan akreditasi NULL`
  );
}

export async function seedUniversitas() {
  console.log("🌱 Mulai seeding data universitas...");

  // Hapus semua data universitas yang ada
  await prisma.universitas.deleteMany();
  console.log("🗑️ Data universitas lama telah dihapus");

  const csvFilePath = path.join(
    __dirname,
    "../../dataset/list_universitas.csv"
  );
  const results: UniversitasCSV[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data: UniversitasCSV) => {
        // Filter hanya universitas yang memiliki semua field wajib valid
        // DAN nama mengandung "Universitas" atau "Institut"
        if (
          data.akreditasi &&
          data.akreditasi !== "NULL" &&
          data.akreditasi.trim() !== "" &&
          data.nama &&
          data.nama !== "NULL" &&
          data.nama.trim() !== "" &&
          (data.nama.toLowerCase().includes("universitas") ||
            data.nama.toLowerCase().includes("institut")) &&
          data.npsn &&
          data.npsn !== "NULL" &&
          data.npsn.trim() !== "" &&
          !isNaN(Number(data.npsn)) &&
          data.kode_pos &&
          data.kode_pos !== "NULL" &&
          data.kode_pos.trim() !== "" &&
          !isNaN(Number(data.kode_pos)) &&
          data.telepon &&
          data.telepon !== "NULL" &&
          data.telepon.trim() !== "" &&
          data.email &&
          data.email !== "NULL" &&
          data.email.trim() !== "" &&
          data.alamat &&
          data.alamat !== "NULL" &&
          data.alamat.trim() !== "" &&
          data.kota &&
          data.kota !== "NULL" &&
          data.kota.trim() !== "" &&
          data.provinsi &&
          data.provinsi !== "NULL" &&
          data.provinsi.trim() !== "" &&
          data["Status "] &&
          data["Status "] !== "NULL" &&
          data["Status "].trim() !== ""
        ) {
          results.push(data);
        }
      })
      .on("end", async () => {
        try {
          console.log(
            `📊 Ditemukan ${results.length} universitas dengan akreditasi valid`
          );

          let successCount = 0;
          let errorCount = 0;

          for (const row of results) {
            try {
              await prisma.universitas.create({
                data: {
                  university_id: parseInt(row.no),
                  nama: row.nama.trim(),
                  npsn: parseInt(row.npsn), // Sudah divalidasi di filter, pasti valid
                  nama_singkat:
                    row["nama singkat"] && row["nama singkat"] !== "NULL"
                      ? row["nama singkat"].trim()
                      : null,
                  kode_pos: parseInt(row.kode_pos), // Sudah divalidasi di filter, pasti valid
                  telepon: row.telepon.trim(), // Sudah divalidasi di filter, pasti valid
                  email: row.email.trim(), // Sudah divalidasi di filter, pasti valid
                  alamat: row.alamat.trim(), // Sudah divalidasi di filter, pasti valid
                  kota: row.kota.trim(), // Sudah divalidasi di filter, pasti valid
                  provinsi: row.provinsi.trim(), // Sudah divalidasi di filter, pasti valid
                  akreditasi: row.akreditasi.trim(), // Sudah divalidasi di filter, pasti valid
                  status: row["Status "].trim(), // Sudah divalidasi di filter, pasti valid
                  rank_qs:
                    row.rank_qs &&
                    row.rank_qs !== "NULL" &&
                    !isNaN(Number(row.rank_qs))
                      ? parseInt(row.rank_qs)
                      : null,
                  rank_country:
                    row.rank_country &&
                    row.rank_country !== "NULL" &&
                    !isNaN(Number(row.rank_country))
                      ? parseInt(row.rank_country)
                      : null,
                },
              });
              successCount++;

              if (successCount % 100 === 0) {
                console.log(`✅ Berhasil import ${successCount} universitas`);
              }
            } catch (error) {
              errorCount++;
              console.error(
                `❌ Error importing universitas: ${row.nama}`,
                error
              );
            }
          }

          console.log(`🎉 Seeding universitas selesai!`);
          console.log(`✅ Berhasil: ${successCount} universitas`);
          console.log(`❌ Error: ${errorCount} universitas`);

          resolve();
        } catch (error) {
          console.error("❌ Error dalam proses seeding:", error);
          reject(error);
        }
      })
      .on("error", (error: any) => {
        console.error("❌ Error membaca file CSV:", error);
        reject(error);
      });
  });
}

export async function runUniversitasSeeder() {
  try {
    console.log("🚀 Memulai proses seeding universitas...");
    await seedUniversitas();
    console.log("✅ Proses seeding universitas berhasil diselesaikan!");
  } catch (error) {
    console.error("❌ Error dalam proses seeding universitas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan jika file ini dieksekusi langsung
if (require.main === module) {
  runUniversitasSeeder();
}
