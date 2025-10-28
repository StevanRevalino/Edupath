/**
 * RIASEC Assessment Types
 */

export type RiasecType =
  | "REALISTIC"
  | "INVESTIGATIVE"
  | "ARTISTIC"
  | "SOCIAL"
  | "ENTERPRISING"
  | "CONVENTIONAL";

export interface RiasecQuestion {
  question_id: number;
  question_text: string;
  riasec_type: RiasecType;
  dimension: string;
}

export interface RiasecResponse {
  question_id: number;
  answer_value: number; // 1-5 Likert scale
}

export interface RiasecScores {
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
  university_count: number;
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
}

export interface AssessmentResult {
  assessment_id: string;
  scores: RiasecScores;
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
  tertiary_type: RiasecType | null;
  holland_code: string;
  recommendations: ProdiRecommendation[];
}

export interface AssessmentHistory {
  assessment_id: string;
  primary_type: RiasecType;
  secondary_type: RiasecType | null;
  holland_code: string;
  completed_at: string;
}
