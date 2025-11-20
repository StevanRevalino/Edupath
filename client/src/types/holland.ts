/**
 * Holland Assessment Types
 */

export type HollandType =
  | "REALISTIC"
  | "INVESTIGATIVE"
  | "ARTISTIC"
  | "SOCIAL"
  | "ENTERPRISING"
  | "CONVENTIONAL";

export interface HollandQuestion {
  question_id: number;
  question_text: string;
  holland_type: HollandType;
}

export interface HollandResponse {
  question_id: number;
  answer_value: number; // 1-5 Likert scale
}

export interface HollandScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface ProdiRecommendation {
  prodi_id: number;
  nama_prodi: string;
  jenjang: string | null;
  match_percentage: number;
  rank: number;
  primary_type: HollandType;
  secondary_type: HollandType | null;
}

export interface AssessmentResult {
  assessment_id: string;
  scores: HollandScores;
  primary_type: HollandType;
  secondary_type: HollandType | null;
  tertiary_type: HollandType | null;
  holland_code: string;
  recommendations: ProdiRecommendation[];
}

export interface AssessmentHistory {
  assessment_id: string;
  primary_type: HollandType;
  secondary_type: HollandType | null;
  holland_code: string;
  completed_at: string;
}
