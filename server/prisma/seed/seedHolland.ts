/**
 * Seed Script for Holland Assessment System
 * This script populates the database with:
 * 1. Holland Questions (60 questions)
 * 2. Holland-Prodi Mappings
 */

import { PrismaClient, HollandType } from "@prisma/client";
import { hollandQuestions } from "./hollandQuestions";
import { hollandProdiMapping } from "./hollandMapping";

const prisma = new PrismaClient();

async function seedHollandQuestions() {
  console.log("🌱 Seeding Holland Questions...");

  // Clear existing questions first
  await prisma.hollandQuestion.deleteMany();

  let count = 0;
  for (const question of hollandQuestions) {
    await prisma.hollandQuestion.create({
      data: {
        question_text: question.question_text,
        holland_type: question.holland_type as HollandType,
      },
    });
    count++;
  }

  console.log(`✅ Seeded ${count} Holland questions`);
}

async function seedHollandProdiMapping() {
  console.log("🌱 Seeding Holland-Prodi Mappings...");

  // Clear existing mappings first
  await prisma.hollandProdiMapping.deleteMany();

  let successCount = 0;
  let skippedCount = 0;

  for (const mapping of hollandProdiMapping) {
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
      const existingMapping = await prisma.hollandProdiMapping.findFirst({
        where: {
          prodi_id: prodi.prodi_id,
          primary_type: mapping.primary_type as HollandType,
          secondary_type: mapping.secondary_type
            ? (mapping.secondary_type as HollandType)
            : null,
        },
      });

      if (!existingMapping) {
        await prisma.hollandProdiMapping.create({
          data: {
            prodi_id: prodi.prodi_id,
            primary_type: mapping.primary_type as HollandType,
            secondary_type: mapping.secondary_type
              ? (mapping.secondary_type as HollandType)
              : null,
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
    `✅ Seeded ${successCount} Holland-Prodi mappings (${skippedCount} skipped)`
  );
}

async function main() {
  try {
    console.log("🚀 Starting Holland seed...\n");

    await seedHollandQuestions();
    await seedHollandProdiMapping();

    console.log("\n✨ Holland seed completed successfully!");
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
