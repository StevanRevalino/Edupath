/**
 * Seed Script for RIASEC Assessment System
 * This script populates the database with:
 * 1. RIASEC Questions (60 questions)
 * 2. RIASEC-Prodi Mappings
 */

import { PrismaClient, RiasecType } from "@prisma/client";
import { riasecQuestions } from "./riasecQuestions";
import { riasecProdiMapping } from "./riasecMapping";

const prisma = new PrismaClient();

async function seedRiasecQuestions() {
  console.log("🌱 Seeding RIASEC Questions...");

  // Clear existing questions first
  await prisma.riasecQuestion.deleteMany();

  let count = 0;
  for (const question of riasecQuestions) {
    await prisma.riasecQuestion.create({
      data: {
        question_text: question.question_text,
        riasec_type: question.riasec_type as RiasecType,
      },
    });
    count++;
  }

  console.log(`✅ Seeded ${count} RIASEC questions`);
}

async function seedRiasecProdiMapping() {
  console.log("🌱 Seeding RIASEC-Prodi Mappings...");

  // Clear existing mappings first
  await prisma.riasecProdiMapping.deleteMany();

  let successCount = 0;
  let skippedCount = 0;

  for (const mapping of riasecProdiMapping) {
    // Try to find prodi using any of the keywords
    let prodi = null;
    let matchedKeyword = "";

    for (const keyword of mapping.keywords) {
      prodi = await prisma.prodi.findFirst({
        where: {
          nama_prodi: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      });

      if (prodi) {
        matchedKeyword = keyword;
        break; // Found a match, stop searching
      }
    }

    if (prodi) {
      // Check if mapping already exists
      const existingMapping = await prisma.riasecProdiMapping.findFirst({
        where: {
          prodi_id: prodi.prodi_id,
          primary_type: mapping.primary_type as RiasecType,
          secondary_type: mapping.secondary_type
            ? (mapping.secondary_type as RiasecType)
            : null,
        },
      });

      if (!existingMapping) {
        await prisma.riasecProdiMapping.create({
          data: {
            prodi_id: prodi.prodi_id,
            primary_type: mapping.primary_type as RiasecType,
            secondary_type: mapping.secondary_type
              ? (mapping.secondary_type as RiasecType)
              : null,
            compatibility_score: mapping.compatibility_score,
          },
        });
        console.log(
          `✅ Mapped "${prodi.nama_prodi}" using keyword "${matchedKeyword}"`
        );
        successCount++;
      } else {
        skippedCount++;
      }
    } else {
      console.log(
        `⚠️  Prodi not found in database for keywords: ${mapping.keywords.join(
          ", "
        )}`
      );
      skippedCount++;
    }
  }

  console.log(
    `✅ Seeded ${successCount} RIASEC-Prodi mappings (${skippedCount} skipped)`
  );
}

async function main() {
  try {
    console.log("🚀 Starting RIASEC seed...\n");

    await seedRiasecQuestions();
    await seedRiasecProdiMapping();

    console.log("\n✨ RIASEC seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
