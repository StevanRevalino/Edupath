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

  private getHighestType(scores: UserRiasecScores): RiasecType {
    const entries = Object.entries(scores) as [
      keyof UserRiasecScores,
      number
    ][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return this.mapToFullType(sorted[0][0]);
  }

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
    let low = 0;
    let medium = 0;
    let high = 0;

    // Membership function untuk "Low" (10-30)
    if (score <= 20) {
      low = 1;
    } else if (score > 20 && score < 30) {
      low = (30 - score) / 10;
    }

    // Membership function untuk "Medium" (25-40)
    if (score >= 25 && score <= 32.5) {
      medium = (score - 25) / 7.5;
    } else if (score > 32.5 && score < 40) {
      medium = (40 - score) / 7.5;
    }

    // Membership function untuk "High" (38-50)
    if (score >= 38 && score <= 42) {
      high = (score - 38) / 4;
    } else if (score > 42) {
      high = 1;
    }

    return { low, medium, high };
  }

  /*
   * STEP 2: RULE BASE
   */
  private getFuzzyRules(): FuzzyRule[] {
    const rules: FuzzyRule[] = [];
    let ruleId = 1;

    // Rule 1: HIGH + HIGH = VERY_HIGH (90-100%)
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "high",
      secondaryScoreFuzzy: "high",
      consequent: "very_high",
    });

    // Rule 2-3: HIGH + MEDIUM = HIGH (75-85%)
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
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "high",
      secondaryScoreFuzzy: "low",
      consequent: "medium",
    });

    // Rule 5: MEDIUM + MEDIUM = MEDIUM (55-65%)
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "medium",
      secondaryScoreFuzzy: "medium",
      consequent: "medium",
    });

    // Rule 6: LOW + HIGH = LOW (50-60%)
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
    rules.push({
      id: ruleId++,
      primaryScoreFuzzy: "low",
      secondaryScoreFuzzy: "low",
      consequent: "very_low",
    });

    return rules;
  }

  /*
   STEP 3: INFERENCE ENGINE
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

      const alpha = Math.min(primaryScoreMembership, secondaryScoreMembership);

      // Only fire rules with alpha > 0
      if (alpha > 0) {
        // STEP 4: DEFUZZIFICATION (Tsukamoto method)
        const z = this.defuzzifyConsequent(rule.consequent, alpha);
        firedRules.push({ rule, alpha, z });
      }
    }

    return firedRules;
  }

  /**
   * STEP 4: DEFUZZIFICATION - Tsukamoto Method
   * Calculate crisp output (z) from fuzzy consequent
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
   * z* = Σ(αi * zi) / Σ(αi)
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
   * @returns Match percentage (0-100)
   */
  public calculateMatchPercentage(
    userScores: UserRiasecScores,
    prodiPrimaryType: RiasecType,
    prodiSecondaryType: RiasecType | null
  ): number {
    // Extract scores yang prodi butuhkan
    const primaryScore =
      userScores[prodiPrimaryType[0] as keyof UserRiasecScores];
    const secondaryScore = prodiSecondaryType
      ? userScores[prodiSecondaryType[0] as keyof UserRiasecScores]
      : 0;

    // STEP 1: FUZZIFICATION
    const primaryFuzzy = this.fuzzifyScore(primaryScore);
    const secondaryFuzzy = this.fuzzifyScore(secondaryScore);

    // STEP 2 & 3: INFERENCE ENGINE
    const fuzzyInput: FuzzyInput = {
      primaryScore,
      secondaryScore,
    };
    const firedRules = this.inferenceEngine(
      fuzzyInput,
      primaryFuzzy,
      secondaryFuzzy
    );

    // STEP 4: WEIGHTED AVERAGE (Defuzzification)
    const matchPercentage = this.calculateWeightedAverage(firedRules);

    // Round to nearest integer and cap at 100
    return Math.min(Math.round(matchPercentage), 100);
  }
}

// Export singleton instance
export const fuzzyLogicService = new FuzzyLogicService();

// Export types for use in other files
export type { UserRiasecScores, RiasecType };
