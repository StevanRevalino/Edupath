import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

function parseIntOrNull(value) {
  if (!value) return null;
  const v = value.trim().toUpperCase();
  return v === "NULL" || v === "" ? null : parseInt(v, 10);
}

function parseStringOrNull(value) {
  if (!value) return null;
  const v = value.trim();
  // Filter alamat yang tidak valid atau terlalu pendek
  if (v.toUpperCase() === "NULL" || v === "" || v.length <= 4) {
    return null;
  }
  return v;
}

async function main() {
  try {
    await client.connect();
    console.log("Terhubung ke PostgreSQL ✅");

    // Hapus data lama terlebih dahulu
    await client.query('DELETE FROM universitas');
    console.log("Data lama telah dihapus ✅");

    const filePath = path.join(__dirname, "../dataset/list_universitas.csv");
    const parser = fs
      .createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
        })
      );

    let count = 0;

    for await (const row of parser) {

    if (
      (!/^universitas\s/i.test(row.nama) && !/^institut\s/i.test(row.nama)) ||
      !parseStringOrNull(row.alamat) ||
      !parseStringOrNull(row.nama) ||
      !parseIntOrNull(row.npsn) ||
      !parseIntOrNull(row.kode_pos) ||
      !parseStringOrNull(row.telepon) ||
      !parseStringOrNull(row.fax) ||
      !parseStringOrNull(row.email) ||
      !parseStringOrNull(row.provinsi)
    ) {
      continue;
    }

      const query = `
        INSERT INTO universitas (
          university_id, nama, npsn, nama_singkat, kode_pos, telepon, fax, email, alamat, kota, provinsi, negara, akreditasi, status, rank_qs, rank_country
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
      `;

      const values = [
        parseInt(row.no, 10), // university_id
        parseStringOrNull(row.nama),
        parseIntOrNull(row.npsn),
        parseStringOrNull(row.nama_singkat),
        parseIntOrNull(row.kode_pos),
        parseStringOrNull(row.telepon),
        parseStringOrNull(row.fax),
        parseStringOrNull(row.email),
        parseStringOrNull(row.alamat),
        parseStringOrNull(row.kota),
        parseStringOrNull(row.provinsi),
        parseStringOrNull(row.negara),
        parseStringOrNull(row.akreditasi),
        parseStringOrNull(row.status),
        parseIntOrNull(row.rank_qs),
        parseIntOrNull(row.rank_country),
      ];

      await client.query(query, values);
      count++;
    }

    console.log(`Import selesai ✅ Total data: ${count}`);
    await client.end();
  } catch (err) {
    console.error("Error:", err);
    await client.end();
  }
}

main();