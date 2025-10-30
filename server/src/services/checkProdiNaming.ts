/**
 * Check Prodi Naming Convention vs PDDIKTI
 */

import prisma from "../configs/prisma";

async function checkProdiNaming() {
  console.log("\n" + "=".repeat(80));
  console.log("🔍 CEK NAMA PRODI: Database vs PDDIKTI Naming Convention");
  console.log("=".repeat(80));

  // Get all prodi with RIASEC mapping
  const mappedProdi = await prisma.riasecProdiMapping.findMany({
    include: {
      prodi: true,
    },
    orderBy: {
      primary_type: "asc",
    },
  });

  console.log(
    `\n📊 Total Prodi yang sudah di-mapping: ${mappedProdi.length}\n`
  );

  // Group by RIASEC type
  const byType: Record<string, any[]> = {
    REALISTIC: [],
    INVESTIGATIVE: [],
    ARTISTIC: [],
    SOCIAL: [],
    ENTERPRISING: [],
    CONVENTIONAL: [],
  };

  mappedProdi.forEach((m) => {
    byType[m.primary_type].push(m);
  });

  // Check each type for potential issues
  console.log("═".repeat(80));
  console.log("🔍 POTENTIAL NAMING ISSUES:");
  console.log("═".repeat(80));

  const issueKeywords = [
    {
      wrong: "Ilmu Komputer",
      correct: "Teknik Informatika",
      reason: "PDDIKTI uses 'Teknik Informatika'",
    },
    {
      wrong: "Computer Science",
      correct: "Teknik Informatika",
      reason: "Use Indonesian naming",
    },
    {
      wrong: "Information System",
      correct: "Sistem Informasi",
      reason: "Use Indonesian naming",
    },
    {
      wrong: "Teknik Komputer",
      correct: "Teknik Informatika",
      reason: "Common mistake",
    },
    {
      wrong: "Bio Kewirausahaan",
      correct: "Kewirausahaan",
      reason: "Non-standard naming",
    },
    {
      wrong: "Ilmu Administrasi Niaga",
      correct: "Administrasi Bisnis",
      reason: "PDDIKTI standard",
    },
  ];

  let foundIssues = 0;

  issueKeywords.forEach((issue) => {
    const found = mappedProdi.filter((m) =>
      m.prodi.nama_prodi.toLowerCase().includes(issue.wrong.toLowerCase())
    );

    if (found.length > 0) {
      foundIssues++;
      console.log(
        `\n⚠️  Issue ${foundIssues}: "${issue.wrong}" → Should be "${issue.correct}"`
      );
      console.log(`   Reason: ${issue.reason}`);
      console.log(`   Found in:`);
      found.forEach((f) => {
        console.log(`   - ${f.prodi.nama_prodi} (ID: ${f.prodi_id})`);
      });
    }
  });

  // Check for TRUE DUPLICATES (semantic duplicates - same prodi, different names)
  console.log("\n" + "═".repeat(80));
  console.log("🔍 CHECK TRUE DUPLICATES (Same Prodi, Different Names):");
  console.log("═".repeat(80));

  // Define semantic duplicate groups
  const semanticDuplicates = [
    {
      standard: "Teknik Informatika",
      aliases: ["Ilmu Komputer", "Computer Science", "Informatika"],
      category: "INFORMATICS",
    },
    {
      standard: "Administrasi Bisnis",
      aliases: ["Ilmu Administrasi Niaga", "Business Administration"],
      category: "BUSINESS ADMIN",
    },
    {
      standard: "Teknik Elektro",
      aliases: ["Electrical Engineering", "Teknik Listrik"],
      category: "ELECTRICAL",
    },
    {
      standard: "Sistem Informasi",
      aliases: ["Information System", "Manajemen Informatika"],
      category: "INFORMATION SYSTEM",
    },
    {
      standard: "Ilmu Komunikasi",
      aliases: ["Communication Science", "Komunikasi"],
      category: "COMMUNICATION",
    },
    {
      standard: "Manajemen",
      aliases: ["Management", "Manajemen Bisnis"],
      category: "MANAGEMENT",
    },
    {
      standard: "Akuntansi",
      aliases: ["Accounting", "Akuntansi Bisnis"],
      category: "ACCOUNTING",
    },
    {
      standard: "Desain Komunikasi Visual",
      aliases: ["DKV", "Visual Communication Design", "Desain Grafis"],
      category: "VISUAL DESIGN",
    },
    {
      standard: "Teknik Komputer",
      aliases: [
        "Computer Engineering",
        "Sistem Komputer",
        "Rekayasa Sistem Komputer",
      ],
      category: "COMPUTER ENGINEERING",
    },
    {
      standard: "Kedokteran",
      aliases: ["Medicine", "Pendidikan Dokter", "Profesi Dokter"],
      category: "MEDICINE",
    },
  ];

  const foundDuplicates: Array<{
    category: string;
    standard: string;
    found: Array<{ nama: string; id: number; riasec: string }>;
  }> = [];

  // Get all prodi (mapped + unmapped)
  const allProdi = await prisma.prodi.findMany({
    include: {
      riasecMappings: true,
    },
  });

  for (const group of semanticDuplicates) {
    const matches = allProdi.filter((prodi) => {
      const nama = prodi.nama_prodi.toLowerCase();
      const standard = group.standard.toLowerCase();

      // Check if prodi name matches standard OR any alias
      if (nama === standard) return true;

      return group.aliases.some((alias) => {
        const aliasLower = alias.toLowerCase();
        // Exact match or contains (for partial matches)
        return nama === aliasLower || nama.includes(aliasLower);
      });
    });

    if (matches.length > 0) {
      foundDuplicates.push({
        category: group.category,
        standard: group.standard,
        found: matches.map((p) => ({
          nama: p.nama_prodi,
          id: p.prodi_id,
          riasec: p.riasecMappings[0]?.primary_type || "❌ NOT MAPPED",
        })),
      });
    }
  }

  console.log(
    `\nFound ${foundDuplicates.length} categories with duplicates:\n`
  );

  foundDuplicates.forEach((dup, idx) => {
    console.log(`\n${idx + 1}. 📂 ${dup.category}`);
    console.log(`   ✅ Standard: "${dup.standard}"`);
    console.log(`   Found ${dup.found.length} variants:`);
    dup.found.forEach((variant) => {
      const isMapped = variant.riasec !== "❌ NOT MAPPED";
      const status = isMapped ? "✅ MAPPED" : "❌ NOT MAPPED";
      console.log(
        `      - "${variant.nama}" (ID: ${variant.id}) [${variant.riasec}] ${status}`
      );
    });
  });

  // Show all mapped prodi by type
  console.log("\n" + "═".repeat(80));
  console.log("📚 MAPPED PRODI BY RIASEC TYPE:");
  console.log("═".repeat(80));

  Object.keys(byType).forEach((type) => {
    console.log(`\n${type} (${byType[type].length} prodi):`);
    byType[type].forEach((m, i) => {
      console.log(
        `   ${i + 1}. ${m.prodi.nama_prodi} (${m.primary_type}${
          m.secondary_type ? " + " + m.secondary_type : ""
        })`
      );
    });
  });

  // Check unmapped prodi with common keywords
  console.log("\n" + "═".repeat(80));
  console.log("🔍 UNMAPPED PRODI WITH COMMON KEYWORDS:");
  console.log("═".repeat(80));

  const commonKeywords = [
    "Teknik",
    "Informatika",
    "Komputer",
    "Manajemen",
    "Ekonomi",
    "Bisnis",
    "Akuntansi",
    "Pendidikan",
    "Kedokteran",
    "Farmasi",
    "Desain",
    "Seni",
    "Komunikasi",
  ];

  for (const keyword of commonKeywords) {
    const unmapped = await prisma.prodi.findMany({
      where: {
        nama_prodi: {
          contains: keyword,
          mode: "insensitive",
        },
        riasecMappings: {
          none: {},
        },
      },
      take: 5,
    });

    if (unmapped.length > 0) {
      console.log(`\n"${keyword}" (${unmapped.length} unmapped):`);
      unmapped.forEach((p) => {
        console.log(`   ❌ ${p.nama_prodi}`);
      });
    }
  }

  console.log("\n" + "═".repeat(80) + "\n");

  await prisma.$disconnect();
}

checkProdiNaming();
