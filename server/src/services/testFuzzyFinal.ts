/**
 * FINAL TEST - Verifikasi Tsukamoto Fuzzy Logic
 * Test berbagai skenario sebelum menghapus console.log
 */

import { fuzzyLogicService } from "./fuzzyLogic";

console.log(
  "\n╔════════════════════════════════════════════════════════════════════════╗"
);
console.log(
  "║     FINAL VERIFICATION - FUZZY LOGIC TSUKAMOTO METHOD                 ║"
);
console.log(
  "╚════════════════════════════════════════════════════════════════════════╝\n"
);

// ============================================================================
// TEST 1: Perfect Match (HIGH + HIGH)
// ============================================================================
console.log("═".repeat(80));
console.log("TEST 1: PERFECT MATCH - User dengan Score Tinggi di Kedua Tipe");
console.log("═".repeat(80));

const test1 = fuzzyLogicService.calculateMatchPercentage(
  { R: 45, I: 44, A: 20, S: 15, E: 12, C: 10 },
  "REALISTIC",
  "INVESTIGATIVE",
  true // Enable logging
);

// ============================================================================
// TEST 2: Good Match (HIGH + MEDIUM)
// ============================================================================
console.log("\n\n" + "═".repeat(80));
console.log("TEST 2: GOOD MATCH - Primary Tinggi, Secondary Sedang");
console.log("═".repeat(80));

const test2 = fuzzyLogicService.calculateMatchPercentage(
  { R: 42, I: 32, A: 18, S: 20, E: 15, C: 12 },
  "REALISTIC",
  "INVESTIGATIVE",
  true
);

// ============================================================================
// TEST 3: Fair Match (MEDIUM + MEDIUM)
// ============================================================================
console.log("\n\n" + "═".repeat(80));
console.log("TEST 3: FAIR MATCH - Kedua Score Sedang");
console.log("═".repeat(80));

const test3 = fuzzyLogicService.calculateMatchPercentage(
  { R: 35, I: 30, A: 25, S: 28, E: 22, C: 20 },
  "REALISTIC",
  "INVESTIGATIVE",
  true
);

// ============================================================================
// TEST 4: Poor Match (LOW + LOW)
// ============================================================================
console.log("\n\n" + "═".repeat(80));
console.log("TEST 4: POOR MATCH - Kedua Score Rendah");
console.log("═".repeat(80));

const test4 = fuzzyLogicService.calculateMatchPercentage(
  { R: 18, I: 15, A: 42, S: 40, E: 35, C: 30 },
  "REALISTIC",
  "INVESTIGATIVE",
  true
);

// ============================================================================
// TEST 5: User Real Case (S=40, A=39, C=39)
// ============================================================================
console.log("\n\n" + "═".repeat(80));
console.log("TEST 5: REAL USER CASE - Holland Code SAC");
console.log("═".repeat(80));

const userScores = { R: 35, I: 30, A: 39, S: 40, E: 35, C: 39 };

console.log("\n🧪 Testing berbagai kombinasi prodi:\n");

const prodiTests = [
  {
    name: "Prodi S+A (Match Holland Code)",
    primary: "SOCIAL" as const,
    secondary: "ARTISTIC" as const,
  },
  {
    name: "Prodi A+S (Match Holland Code)",
    primary: "ARTISTIC" as const,
    secondary: "SOCIAL" as const,
  },
  {
    name: "Prodi R+I (Tidak Match)",
    primary: "REALISTIC" as const,
    secondary: "INVESTIGATIVE" as const,
  },
  {
    name: "Prodi E+C",
    primary: "ENTERPRISING" as const,
    secondary: "CONVENTIONAL" as const,
  },
];

const results = prodiTests.map((prodi) => {
  const match = fuzzyLogicService.calculateMatchPercentage(
    userScores,
    prodi.primary,
    prodi.secondary,
    false // No detail logging for summary
  );
  return { ...prodi, match };
});

// Sort by match percentage
results.sort((a, b) => b.match - a.match);

console.log("\n📊 RANKING HASIL:\n");
results.forEach((result, index) => {
  const medal =
    index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
  const bar = "█".repeat(Math.floor(result.match / 5));
  console.log(`   ${medal} ${result.match}% ${bar}`);
  console.log(`      ${result.name}`);
  console.log(
    `      Primary: ${result.primary}, Secondary: ${result.secondary}\n`
  );
});

// Detail calculation for top match
console.log("═".repeat(80));
console.log("🔍 DETAILED CALCULATION - Top Matching Prodi:");
console.log("═".repeat(80));

fuzzyLogicService.calculateMatchPercentage(
  userScores,
  results[0].primary,
  results[0].secondary,
  true // Enable detailed logging
);

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "╔" + "═".repeat(78) + "╗");
console.log(
  "║" + " ".repeat(25) + "VERIFICATION SUMMARY" + " ".repeat(33) + "║"
);
console.log("╚" + "═".repeat(78) + "╝\n");

console.log("✅ TEST 1 (HIGH + HIGH):     ", test1, "% - Expected: 90-100%");
console.log("✅ TEST 2 (HIGH + MEDIUM):   ", test2, "% - Expected: 75-90%");
console.log("✅ TEST 3 (MEDIUM + MEDIUM): ", test3, "% - Expected: 60-75%");
console.log("✅ TEST 4 (LOW + LOW):       ", test4, "% - Expected: 20-40%");
console.log("\n✅ Real User Case:");
console.log(
  "   - Prodi S+A (Match):     ",
  results.find((r) => r.primary === "SOCIAL")?.match,
  "%"
);
console.log(
  "   - Prodi R+I (Not Match): ",
  results.find((r) => r.primary === "REALISTIC")?.match,
  "%"
);

console.log("\n🎯 KESIMPULAN:");
if (
  test1 >= 90 &&
  test2 >= 75 &&
  test2 < 90 &&
  test3 >= 60 &&
  test3 < 75 &&
  test4 < 40
) {
  console.log("   ✅ Fuzzy Logic Tsukamoto bekerja dengan BENAR!");
  console.log(
    "   ✅ Membership functions sudah tepat (LOW: 10-30, MEDIUM: 25-40, HIGH: 38-50)"
  );
  console.log("   ✅ Rules firing dengan konsisten");
  console.log("   ✅ Weighted average calculation akurat");
} else {
  console.log("   ⚠️  Ada ketidaksesuaian dengan expected range");
}

console.log("\n" + "═".repeat(80) + "\n");
