import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

interface UniversitasCSV {
  university_id: string;
  nama: string;
  npsn?: string;
  "nama singkat"?: string;
  kode_pos?: string;
  telepon?: string;
  fax?: string;
  email?: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  akreditasi?: string;
  rank_qs?: string;
  rank_country?: string;
}

interface ProdiCSV {
  prodi_id: string;
  nama_prodi: string;
  jenjang?: string;
}

interface ProdiPTCSV {
  id: string;
  prodi_id: string;
  university_id: string;
}

async function seedLocalData(force: boolean = false) {
  try {
    // Check if data already exists
    const existingCounts = {
      universities: await prisma.universitas.count(),
      prodi: await prisma.prodi.count(),
      relations: await prisma.prodiPT.count(),
    };

    if (
      !force &&
      (existingCounts.universities > 0 ||
        existingCounts.prodi > 0 ||
        existingCounts.relations > 0)
    ) {
      console.log(
        "⏭️  Skipping data seeding as data already exists. Use --force to override."
      );
      return;
    }

    if (
      force &&
      (existingCounts.universities > 0 ||
        existingCounts.prodi > 0 ||
        existingCounts.relations > 0)
    ) {
      console.log("🧹 Force flag detected, clearing existing data...");
      await prisma.prodiPT.deleteMany();
      await prisma.prodi.deleteMany();
      await prisma.universitas.deleteMany();
    } else {
      console.log("📝 No existing data found, proceeding with seeding...");
    }

    // Load CSV files - dataset is in server/dataset, not server/src/dataset
    const datasetPath = path.join(__dirname, "..", "..", "dataset");

    // 1. Load and seed Universitas
    console.log("📚 Seeding universities...");
    const universitasCSV = fs.readFileSync(
      path.join(datasetPath, "universitas.csv"),
      "utf-8"
    );
    const universitasData: UniversitasCSV[] = parse(universitasCSV, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const universitasToInsert = universitasData
      .filter((row) => row.university_id && !isNaN(parseInt(row.university_id)))
      .map((row) => ({
        university_id: parseInt(row.university_id),
        nama: row.nama || "",
        npsn: row.npsn || null,
        nama_singkat: row["nama singkat"] || null,
        kode_pos: row.kode_pos || null,
        telepon: row.telepon || null,
        fax: row.fax || null,
        email: row.email || null,
        alamat: row.alamat || null,
        kota: row.kota || null,
        provinsi: row.provinsi || null,
        akreditasi: row.akreditasi || null,
        rank_qs: row.rank_qs || null,
        rank_country: row.rank_country || null,
      }));

    await prisma.universitas.createMany({
      data: universitasToInsert,
      skipDuplicates: true,
    });
    console.log(`✅ Seeded ${universitasToInsert.length} universities`);

    // 2. Load and seed Prodi
    console.log("📖 Seeding prodi...");
    const prodiCSV = fs.readFileSync(
      path.join(datasetPath, "prodi.csv"),
      "utf-8"
    );
    const prodiData: ProdiCSV[] = parse(prodiCSV, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const prodiToInsert = prodiData
      .filter((row) => row.prodi_id && !isNaN(parseInt(row.prodi_id)))
      .map((row) => ({
        prodi_id: parseInt(row.prodi_id),
        nama_prodi: row.nama_prodi || "",
        jenjang: row.jenjang || null,
      }));

    await prisma.prodi.createMany({
      data: prodiToInsert,
      skipDuplicates: true,
    });
    console.log(`✅ Seeded ${prodiToInsert.length} prodi`);

    // 3. Load and seed ProdiPT (relations)
    console.log("🔗 Seeding prodi-university relations...");
    const prodiPTCSV = fs.readFileSync(
      path.join(datasetPath, "prodi_pt.csv"),
      "utf-8"
    );
    const prodiPTData: ProdiPTCSV[] = parse(prodiPTCSV, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Get valid university and prodi IDs
    const validUniversityIds = new Set(
      universitasToInsert.map((u) => u.university_id)
    );
    const validProdiIds = new Set(prodiToInsert.map((p) => p.prodi_id));

    const prodiPTToInsert = prodiPTData
      .filter((row) => {
        const prodiId = parseFloat(row.prodi_id);
        const universityId = parseInt(row.university_id);
        return (
          !isNaN(prodiId) &&
          !isNaN(universityId) &&
          validProdiIds.has(prodiId) &&
          validUniversityIds.has(universityId)
        );
      })
      .map((row) => ({
        prodi_id: parseInt(parseFloat(row.prodi_id).toString()),
        university_id: parseInt(row.university_id),
      }));

    // Insert in batches to avoid memory issues
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < prodiPTToInsert.length; i += batchSize) {
      const batch = prodiPTToInsert.slice(i, i + batchSize);
      try {
        await prisma.prodiPT.createMany({
          data: batch,
          skipDuplicates: true,
        });
        insertedCount += batch.length;
        console.log(
          `📊 Inserted batch ${
            Math.floor(i / batchSize) + 1
          }, total: ${insertedCount}`
        );
      } catch (error) {
        console.warn(
          `⚠️ Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
          error
        );
      }
    }

    console.log(`✅ Seeded ${insertedCount} prodi-university relations`);

    // Print summary
    const counts = {
      universities: await prisma.universitas.count(),
      prodi: await prisma.prodi.count(),
      relations: await prisma.prodiPT.count(),
    };

    console.log("\n📈 Final counts:");
    console.log(`🏫 Universities: ${counts.universities}`);
    console.log(`📚 Prodi: ${counts.prodi}`);
    console.log(`🔗 Relations: ${counts.relations}`);
    console.log("\n🎉 Local data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding local data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeder if called directly
if (require.main === module) {
  const force = process.argv.includes("--force");
  seedLocalData(force)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedLocalData };
