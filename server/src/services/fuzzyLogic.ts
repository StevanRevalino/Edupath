/**
 * Fuzzy Logic Tsukamoto Implementation for RIASEC Recommendation System
 *
 * This service implements Tsukamoto fuzzy inference method to calculate
 * match percentage between user's RIASEC scores and program study requirements.
 *
 * References:
 * - Tsukamoto, Y. (1979). An approach to fuzzy reasoning method
 * - Kusumadewi, S., & Purnomo, H. (2010). Aplikasi Logika Fuzzy untuk Pendukung Keputusan
 */

type RiasecType =
  | "REALISTIC"
  | "INVESTIGATIVE"
  | "ARTISTIC"
  | "SOCIAL"
  | "ENTERPRISING"
  | "CONVENTIONAL";

interface UserRiasecScores {
  R: number; // Realistic (0-50)
  I: number; // Investigative (0-50)
  A: number; // Artistic (0-50)
  S: number; // Social (0-50)
  E: number; // Enterprising (0-50)
  C: number; // Conventional (0-50)
}

interface FuzzyMembershipValue {
  low: number; // Membership degree untuk "rendah"
  medium: number; // Membership degree untuk "sedang"
  high: number; // Membership degree untuk "tinggi"
}

interface FuzzyInput {
  primaryScore: number; // Skor tipe primary yang PRODI butuhkan (0-50)
  secondaryScore: number; // Skor tipe secondary yang PRODI butuhkan (0-50)
}

interface FuzzyRule {
  id: number;
  primaryScoreFuzzy: "low" | "medium" | "high";
  secondaryScoreFuzzy: "low" | "medium" | "high";
  consequent: "very_low" | "low" | "medium" | "high" | "very_high"; // Tingkat kesesuaian
}

export class FuzzyLogicService {
  /**
   * Helper: Map short type to full type name
   */
  private mapToFullType(short: keyof UserRiasecScores): RiasecType {
    const map: Record<keyof UserRiasecScores, RiasecType> = {
      R: "REALISTIC",
      I: "INVESTIGATIVE",
      A: "ARTISTIC",
      S: "SOCIAL",
      E: "ENTERPRISING",
      C: "CONVENTIONAL",
    };
    return map[short];
  }

  /**
   * Helper: Get highest scoring type from user scores
   */
  private getHighestType(scores: UserRiasecScores): RiasecType {
    const entries = Object.entries(scores) as [
      keyof UserRiasecScores,
      number
    ][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return this.mapToFullType(sorted[0][0]);
  }

  /**
   * Helper: Get second highest scoring type from user scores
   */
  private getSecondHighestType(scores: UserRiasecScores): RiasecType | null {
    const entries = Object.entries(scores) as [
      keyof UserRiasecScores,
      number
    ][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted.length > 1 ? this.mapToFullType(sorted[1][0]) : null;
  }

  /**
   * STEP 1: FUZZIFICATION
   * Convert crisp input (skor 10-50) to fuzzy membership values
   */
  private fuzzifyScore(score: number): FuzzyMembershipValue {
    // Membership function untuk skor RIASEC (10-50)
    // Low: 10-30 (di bawah rata-rata)
    // Medium: 25-40 (rata-rata)
    // High: 38-50 (di atas rata-rata, smooth transition dari 38)

    let low = 0;
    let medium = 0;
    let high = 0;

    // Membership function untuk "Low" (10-30)
    if (score <= 20) {
      low = 1; // Maksimal membership untuk score 10-20
    } else if (score > 20 && score < 30) {
      low = (30 - score) / 10; // Linear turun dari 1 ke 0
    }

    // Membership function untuk "Medium" (25-40)
    if (score >= 25 && score <= 32.5) {
      medium = (score - 25) / 7.5; // Linear naik dari 0 ke 1
    } else if (score > 32.5 && score < 40) {
      medium = (40 - score) / 7.5; // Linear turun dari 1 ke 0
    }

    // Membership function untuk "High" (38-50)
    // Smooth transition: mulai naik dari 38, full membership di 42-50
    if (score >= 38 && score <= 42) {
      high = (score - 38) / 4; // Linear naik dari 0 ke 1 (38→42)
    } else if (score > 42) {
      high = 1; // Maksimal membership untuk score 42-50
    }

    return { low, medium, high };
  }

  /**
   * STEP 2: RULE BASE
   * Rules hanya berdasarkan SCORE yang prodi butuhkan
   * TIDAK peduli tipe primary/secondary user!
   */
  private getFuzzyRules(): FuzzyRule[] {
    const rules: FuzzyRule[] = [];
    let ruleId = 1;

    // Rule 1: HIGH + HIGH = VERY_HIGH (90-100%)
    // User punya score tinggi untuk KEDUA tipe yang prodi butuhkan
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "high",
      secondaryScoreFuzzy: "high",
      consequent: "very_high",
    });

    // Rule 2-3: HIGH + MEDIUM = HIGH (75-85%)
    // Primary tinggi, secondary sedang
    rules.push(
      {
        id: ruleId++,
        primaryScoreFuzzy: "high",
        secondaryScoreFuzzy: "medium",
        consequent: "high",
      },
      {
        id: ruleId++,
        primaryScoreFuzzy: "medium",
        secondaryScoreFuzzy: "high",
        consequent: "high",
      }
    );

    // Rule 4: HIGH + LOW = MEDIUM (60-70%)
    // Primary tinggi tapi secondary rendah
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "high",
      secondaryScoreFuzzy: "low",
      consequent: "medium",
    });

    // Rule 5: MEDIUM + MEDIUM = MEDIUM (55-65%)
    // Kedua score sedang
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "medium",
      secondaryScoreFuzzy: "medium",
      consequent: "medium",
    });

    // Rule 6: LOW + HIGH = LOW (50-60%)
    // Primary rendah, secondary tinggi - kurang ideal
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "low",
      secondaryScoreFuzzy: "high",
      consequent: "low",
    });

    // Rule 7-8: MEDIUM + LOW atau LOW + MEDIUM = LOW (40-50%)
    rules.push(
      {
        id: ruleId++,
        primaryScoreFuzzy: "medium",
        secondaryScoreFuzzy: "low",
        consequent: "low",
      },
      {
        id: ruleId++,
        primaryScoreFuzzy: "low",
        secondaryScoreFuzzy: "medium",
        consequent: "low",
      }
    );

    // Rule 9: LOW + LOW = VERY_LOW (20-30%)
    // Kedua score rendah
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "low",
      secondaryScoreFuzzy: "low",
      consequent: "very_low",
    });

    return rules;
  }

  /**
   * STEP 3: INFERENCE ENGINE
   * Apply fuzzy rules and calculate firing strength (α)
   * HANYA berdasarkan score fuzzy, TIDAK cek type match!
   */
  private inferenceEngine(
    input: FuzzyInput,
    primaryFuzzy: FuzzyMembershipValue,
    secondaryFuzzy: FuzzyMembershipValue
  ): { rule: FuzzyRule; alpha: number; z: number }[] {
    const rules = this.getFuzzyRules();
    const firedRules: { rule: FuzzyRule; alpha: number; z: number }[] = [];

    for (const rule of rules) {
      // Get membership values for antecedents
      const primaryScoreMembership =
        primaryFuzzy[
          rule.primaryScoreFuzzy.toLowerCase() as keyof FuzzyMembershipValue
        ];
      const secondaryScoreMembership =
        secondaryFuzzy[
          rule.secondaryScoreFuzzy.toLowerCase() as keyof FuzzyMembershipValue
        ];

      // Calculate firing strength (α-predicate) using MIN operator
      // HANYA dari score fuzzy, TIDAK cek match type!
      const alpha = Math.min(primaryScoreMembership, secondaryScoreMembership);

      // Only fire rules with alpha > 0
      if (alpha > 0) {
        // STEP 4: DEFUZZIFICATION (Tsukamoto method)
        // Calculate crisp output (z) using inverse membership function
        const z = this.defuzzifyConsequent(rule.consequent, alpha);
        firedRules.push({ rule, alpha, z });
      }
    }

    return firedRules;
  }

  /**
   * STEP 4: DEFUZZIFICATION - Tsukamoto Method
   * Calculate crisp output (z) from fuzzy consequent
   *
   * Tsukamoto uses monotonic membership functions where each output
   * is represented by a crisp value derived from the firing strength
   */
  private defuzzifyConsequent(
    consequent: "very_low" | "low" | "medium" | "high" | "very_high",
    alpha: number
  ): number {
    // Define output ranges for each linguistic term
    // Using linear inverse membership function

    let z = 0;

    switch (consequent) {
      case "very_low": // 20-40%
        z = 20 + alpha * 20; // Linear: 20 + α * (40-20)
        break;

      case "low": // 40-60%
        z = 40 + alpha * 20; // Linear: 40 + α * (60-40)
        break;

      case "medium": // 60-75%
        z = 60 + alpha * 15; // Linear: 60 + α * (75-60)
        break;

      case "high": // 75-90%
        z = 75 + alpha * 15; // Linear: 75 + α * (90-75)
        break;

      case "very_high": // 90-100%
        z = 90 + alpha * 10; // Linear: 90 + α * (100-90)
        break;
    }

    return z;
  }

  /**
   * STEP 5: WEIGHTED AVERAGE
   * Calculate final crisp output using weighted average of all fired rules
   * Formula: z* = Σ(αi * zi) / Σ(αi)
   */
  private calculateWeightedAverage(
    firedRules: { rule: FuzzyRule; alpha: number; z: number }[]
  ): number {
    if (firedRules.length === 0) {
      return 0; // No rules fired
    }

    const numerator = firedRules.reduce(
      (sum, fired) => sum + fired.alpha * fired.z,
      0
    );
    const denominator = firedRules.reduce((sum, fired) => sum + fired.alpha, 0);

    return numerator / denominator;
  }

  /**
   * MAIN METHOD: Calculate match percentage using Fuzzy Tsukamoto
   *
   * @param userScores - User's scores for all 6 RIASEC types
   * @param prodiPrimaryType - Prodi's primary RIASEC type
   * @param prodiSecondaryType - Prodi's secondary RIASEC type
   * @param enableLog - Enable detailed console logging
   * @returns Match percentage (0-100)
   */
  public calculateMatchPercentage(
    userScores: UserRiasecScores,
    prodiPrimaryType: RiasecType,
    prodiSecondaryType: RiasecType | null,
    enableLog: boolean = false
  ): number {
    // Extract scores yang prodi butuhkan (PENTING!)
    const primaryScore =
      userScores[prodiPrimaryType[0] as keyof UserRiasecScores];
    const secondaryScore = prodiSecondaryType
      ? userScores[prodiSecondaryType[0] as keyof UserRiasecScores]
      : 0;

    // Determine user's top types
    const userPrimaryType = this.getHighestType(userScores);
    const userSecondaryType = this.getSecondHighestType(userScores);

    if (enableLog) {
      console.log("\n" + "=".repeat(80));
      console.log("🧮 FUZZY LOGIC TSUKAMOTO - CALCULATION PROCESS");
      console.log("=".repeat(80));
      console.log("\n📥 INPUT:");
      console.log(`   User RIASEC Scores:`);
      console.log(`   ├─ R (Realistic): ${userScores.R}`);
      console.log(`   ├─ I (Investigative): ${userScores.I}`);
      console.log(`   ├─ A (Artistic): ${userScores.A}`);
      console.log(`   ├─ S (Social): ${userScores.S}`);
      console.log(`   ├─ E (Enterprising): ${userScores.E}`);
      console.log(`   └─ C (Conventional): ${userScores.C}`);
      console.log(`\n   User Holland Code:`);
      console.log(`   ├─ Primary: ${userPrimaryType}`);
      console.log(`   └─ Secondary: ${userSecondaryType || "N/A"}`);
      console.log(`\n   Program Studi Requirements:`);
      console.log(
        `   ├─ Primary: ${prodiPrimaryType} (user score: ${primaryScore})`
      );
      console.log(
        `   └─ Secondary: ${
          prodiSecondaryType || "N/A"
        } (user score: ${secondaryScore})`
      );
    }

    // STEP 1: FUZZIFICATION
    const primaryFuzzy = this.fuzzifyScore(primaryScore);
    const secondaryFuzzy = this.fuzzifyScore(secondaryScore);

    if (enableLog) {
      console.log("\n" + "─".repeat(80));
      console.log("📊 STEP 1: FUZZIFICATION");
      console.log("─".repeat(80));
      console.log(`\n   Primary Score (${prodiPrimaryType}=${primaryScore}):`);
      console.log(`   ├─ μLow    = ${(primaryFuzzy.low * 100).toFixed(1)}%`);
      console.log(`   ├─ μMedium = ${(primaryFuzzy.medium * 100).toFixed(1)}%`);
      console.log(`   └─ μHigh   = ${(primaryFuzzy.high * 100).toFixed(1)}%`);
      console.log(
        `\n   Secondary Score (${
          prodiSecondaryType || "N/A"
        }=${secondaryScore}):`
      );
      console.log(`   ├─ μLow    = ${(secondaryFuzzy.low * 100).toFixed(1)}%`);
      console.log(
        `   ├─ μMedium = ${(secondaryFuzzy.medium * 100).toFixed(1)}%`
      );
      console.log(`   └─ μHigh   = ${(secondaryFuzzy.high * 100).toFixed(1)}%`);
    }

    // Prepare fuzzy input
    const fuzzyInput: FuzzyInput = {
      primaryScore,
      secondaryScore,
    };

    // STEP 2 & 3: INFERENCE ENGINE
    const firedRules = this.inferenceEngine(
      fuzzyInput,
      primaryFuzzy,
      secondaryFuzzy
    );

    if (enableLog) {
      console.log("\n" + "─".repeat(80));
      console.log("⚙️  STEP 2: INFERENCE ENGINE (Rule Evaluation)");
      console.log("─".repeat(80));
      console.log(`\n   Total Rules Evaluated: 9`);
      console.log(`   Rules Fired: ${firedRules.length}\n`);

      if (firedRules.length > 0) {
        console.log("   Fired Rules Details:");
        firedRules.forEach((fr, index) => {
          console.log(`   ${index + 1}. Rule ${fr.rule.id}:`);
          console.log(
            `      ├─ Condition: ${fr.rule.primaryScoreFuzzy.toUpperCase()} + ${fr.rule.secondaryScoreFuzzy.toUpperCase()}`
          );
          console.log(`      ├─ α (firing strength) = ${fr.alpha.toFixed(3)}`);
          console.log(
            `      ├─ Consequent: ${fr.rule.consequent.toUpperCase()}`
          );
          console.log(`      └─ z (crisp output) = ${fr.z.toFixed(2)}%`);
        });
      } else {
        console.log("   ⚠️  No rules fired!");
      }
    }

    // STEP 3 & 4: DEFUZZIFICATION & WEIGHTED AVERAGE
    const matchPercentage = this.calculateWeightedAverage(firedRules);

    if (enableLog) {
      console.log("\n" + "─".repeat(80));
      console.log("📐 STEP 3 & 4: WEIGHTED AVERAGE CALCULATION");
      console.log("─".repeat(80));

      if (firedRules.length > 0) {
        console.log("\n   Formula: z* = Σ(αi × zi) / Σ(αi)\n");

        const numerator = firedRules.reduce(
          (sum, fired) => sum + fired.alpha * fired.z,
          0
        );
        const denominator = firedRules.reduce(
          (sum, fired) => sum + fired.alpha,
          0
        );

        console.log("   Numerator (Σ αi × zi):");
        firedRules.forEach((fr, index) => {
          const contribution = fr.alpha * fr.z;
          console.log(
            `   ${index + 1}. α${fr.rule.id} × z${
              fr.rule.id
            } = ${fr.alpha.toFixed(3)} × ${fr.z.toFixed(
              2
            )} = ${contribution.toFixed(2)}`
          );
        });
        console.log(`   └─ Total: ${numerator.toFixed(2)}`);

        console.log("\n   Denominator (Σ αi):");
        firedRules.forEach((fr, index) => {
          console.log(
            `   ${index + 1}. α${fr.rule.id} = ${fr.alpha.toFixed(3)}`
          );
        });
        console.log(`   └─ Total: ${denominator.toFixed(3)}`);

        console.log(`\n   Calculation:`);
        console.log(
          `   z* = ${numerator.toFixed(2)} / ${denominator.toFixed(3)}`
        );
        console.log(`      = ${matchPercentage.toFixed(2)}%`);
      } else {
        console.log("   No calculation (no rules fired)");
      }
    }

    // Round to nearest integer and cap at 100
    const finalResult = Math.min(Math.round(matchPercentage), 100);

    if (enableLog) {
      console.log("\n" + "=".repeat(80));
      console.log("✅ FINAL RESULT");
      console.log("=".repeat(80));
      console.log(`\n   Match Percentage: ${finalResult}%`);

      // Interpretation
      let interpretation = "";
      if (finalResult >= 90) {
        interpretation = "🟢 SANGAT COCOK - Excellent Match!";
      } else if (finalResult >= 75) {
        interpretation = "🟢 COCOK - Good Match";
      } else if (finalResult >= 60) {
        interpretation = "🟡 CUKUP COCOK - Fair Match";
      } else if (finalResult >= 45) {
        interpretation = "🟠 KURANG COCOK - Below Average";
      } else {
        interpretation = "🔴 TIDAK COCOK - Poor Match";
      }

      console.log(`   Interpretation: ${interpretation}`);
      console.log("\n" + "=".repeat(80) + "\n");
    }

    return finalResult;
  }

  /**
   * Debug method to see fuzzy inference details (DEPRECATED - Use enableLog parameter instead)
   * This method is kept for backward compatibility
   */
  public debugFuzzyInference(
    userScores: UserRiasecScores,
    prodiPrimaryType: RiasecType,
    prodiSecondaryType: RiasecType | null
  ): any {
    const primaryScore =
      userScores[prodiPrimaryType[0] as keyof UserRiasecScores];
    const secondaryScore = prodiSecondaryType
      ? userScores[prodiSecondaryType[0] as keyof UserRiasecScores]
      : 0;

    const primaryFuzzy = this.fuzzifyScore(primaryScore);
    const secondaryFuzzy = this.fuzzifyScore(secondaryScore);

    const fuzzyInput: FuzzyInput = {
      primaryScore,
      secondaryScore,
    };

    const firedRules = this.inferenceEngine(
      fuzzyInput,
      primaryFuzzy,
      secondaryFuzzy
    );

    const matchPercentage = this.calculateWeightedAverage(firedRules);

    const userPrimaryType = this.getHighestType(userScores);
    const userSecondaryType = this.getSecondHighestType(userScores);

    return {
      input: {
        userScores,
        userPrimaryType,
        userSecondaryType,
        prodiPrimaryType,
        prodiSecondaryType,
        extractedScores: {
          primary: primaryScore,
          secondary: secondaryScore,
        },
      },
      fuzzification: {
        primary: primaryFuzzy,
        secondary: secondaryFuzzy,
      },
      fuzzyInput,
      firedRules: firedRules.map((fr) => ({
        ruleId: fr.rule.id,
        consequent: fr.rule.consequent,
        alpha: fr.alpha.toFixed(3),
        z: fr.z.toFixed(2),
      })),
      totalFiredRules: firedRules.length,
      finalMatchPercentage: matchPercentage.toFixed(2) + "%",
    };
  }
}

// Export singleton instance
export const fuzzyLogicService = new FuzzyLogicService();

// Export types for use in other files
export type { UserRiasecScores, RiasecType };
