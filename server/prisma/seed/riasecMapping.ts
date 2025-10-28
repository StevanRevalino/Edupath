/**
 * RIASEC to Prodi (Program Studi) Mapping
 * Based on Holland's RIASEC Environmental Typology
 * Reference: Table 4.1 Summary of Holland Types Related to Major Fields
 *
 * This mapping connects personality types with compatible academic programs
 * Each mapping includes:
 * - keywords: Array of possible prodi names (for fuzzy matching)
 * - primary_type: Main RIASEC type
 * - secondary_type: Secondary RIASEC type (optional)
 * - compatibility_score: Base compatibility (80-100)
 *
 * MATCHING STRATEGY:
 * Seed script will try to match using keywords with LIKE %keyword%
 * This handles variations like "Teknik Informatika" vs "Informatika"
 */

interface ProdiMapping {
  keywords: string[]; // Multiple possible names
  primary_type: string;
  secondary_type: string | null;
  compatibility_score: number;
}

export const riasecProdiMapping: ProdiMapping[] = [
  // ========================================
  // REALISTIC (R) Programs
  // Ref: "mechanical and athletic abilities, likes to work outdoors and with tools"
  // Examples: computer engineering, forestry, surveying, etc.
  // ========================================
  {
    keywords: ["Teknik Mesin", "Mesin"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 95,
  },
  {
    keywords: ["Teknik Elektro", "Elektro"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 95,
  },
  {
    keywords: ["Teknik Sipil", "Sipil"],
    primary_type: "REALISTIC",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 95,
  },
  {
    keywords: ["Teknik Industri", "Industri"],
    primary_type: "REALISTIC",
    secondary_type: "ENTERPRISING",
    compatibility_score: 90,
  },
  {
    keywords: ["Arsitektur", "Architecture"],
    primary_type: "REALISTIC",
    secondary_type: "ARTISTIC",
    compatibility_score: 90,
  },
  {
    keywords: [
      "Teknik Informatika",
      "Informatika",
      "Ilmu Komputer",
      "Computer Science",
      "Teknik Komputer",
    ],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  {
    keywords: ["Sistem Informasi", "Information System"],
    primary_type: "REALISTIC",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Teknik Pertanian", "Pertanian", "Agricultural Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Teknik Kimia", "Chemical Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Teknik Metalurgi", "Metalurgi", "Metallurgical Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Teknik Perminyakan", "Perminyakan", "Petroleum Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Teknologi Pangan", "Food Technology"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  {
    keywords: ["Teknik Kelautan", "Kelautan", "Marine Engineering", "Ocean"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  {
    keywords: ["Kehutanan", "Forestry"],
    primary_type: "REALISTIC",
    secondary_type: null,
    compatibility_score: 90,
  },
  {
    keywords: ["Peternakan", "Animal Science", "Animal Husbandry"],
    primary_type: "REALISTIC",
    secondary_type: null,
    compatibility_score: 85,
  },

  // ========================================
  // INVESTIGATIVE (I) Programs
  // Ref: "math and science abilities, likes to work alone and solve problems"
  // Examples: biology, chemistry, physics, geology, medical technician, psychology
  // ========================================
  {
    keywords: ["Kedokteran", "Medicine", "Pendidikan Dokter"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "SOCIAL",
    compatibility_score: 100,
  },
  {
    keywords: ["Farmasi", "Pharmacy", "Apoteker"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 95,
  },
  {
    keywords: ["Biologi", "Biology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 95,
  },
  {
    keywords: ["Kimia", "Chemistry"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 95,
  },
  {
    keywords: ["Fisika", "Physics"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 95,
  },
  {
    keywords: ["Matematika", "Mathematics"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 95,
  },
  {
    keywords: ["Statistika", "Statistics", "Statistik"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Psikologi", "Psychology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "SOCIAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Ilmu Komputer", "Computer Science"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Bioteknologi", "Biotechnology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Kedokteran Gigi", "Dentistry", "Pendidikan Dokter Gigi"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "SOCIAL",
    compatibility_score: 95,
  },
  {
    keywords: ["Kedokteran Hewan", "Veterinary"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Geofisika", "Geophysics", "Geologi", "Geology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
    compatibility_score: 85,
  },
  {
    keywords: ["Mikrobiologi", "Microbiology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 90,
  },
  {
    keywords: ["Astronomi", "Astronomy"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
    compatibility_score: 95,
  },

  // ========================================
  // ARTISTIC (A) Programs
  // Ref: "artistic skills, enjoys creating original work"
  // Examples: composer, music, stage director, writer, interior decoration, acting
  // ========================================
  {
    keywords: ["Desain Grafis", "Graphic Design", "Desain"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
    compatibility_score: 95,
  },
  {
    keywords: ["Desain Interior", "Interior Design"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
    compatibility_score: 95,
  },
  {
    keywords: [
      "Desain Komunikasi Visual",
      "DKV",
      "Visual Communication Design",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
    compatibility_score: 95,
  },
  {
    keywords: ["Seni Rupa", "Fine Arts"],
    primary_type: "ARTISTIC",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: ["Seni Musik", "Music", "Musik"],
    primary_type: "ARTISTIC",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: ["Seni Tari", "Dance"],
    primary_type: "ARTISTIC",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: [
      "Sastra Indonesia",
      "Indonesian Literature",
      "Bahasa dan Sastra Indonesia",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
    compatibility_score: 90,
  },
  {
    keywords: [
      "Sastra Inggris",
      "English Literature",
      "Bahasa dan Sastra Inggris",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Ilmu Komunikasi", "Communication", "Komunikasi"],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Film dan Televisi", "Film", "Broadcasting", "Television"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
    compatibility_score: 90,
  },
  {
    keywords: ["Periklanan", "Advertising"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
    compatibility_score: 90,
  },
  {
    keywords: ["Fotografi", "Photography"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
    compatibility_score: 85,
  },
  {
    keywords: ["Fashion Design", "Desain Fashion", "Desain Mode"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
    compatibility_score: 85,
  },
  {
    keywords: ["Animasi", "Animation"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
    compatibility_score: 90,
  },

  // ========================================
  // SOCIAL (S) Programs
  // Ref: "likes to help, teach, and counsel people"
  // Examples: education, speech therapy, counseling, nursing, sports medicine
  // ========================================
  {
    keywords: ["Pendidikan", "Education"],
    primary_type: "SOCIAL",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: [
      "Pendidikan Guru Sekolah Dasar",
      "PGSD",
      "Primary Teacher Education",
    ],
    primary_type: "SOCIAL",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: [
      "Bimbingan dan Konseling",
      "Guidance and Counseling",
      "Konseling",
    ],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 100,
  },
  {
    keywords: ["Ilmu Keperawatan", "Nursing", "Keperawatan", "Ners"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 95,
  },
  {
    keywords: ["Kesehatan Masyarakat", "Public Health"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Pekerjaan Sosial", "Social Work"],
    primary_type: "SOCIAL",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: ["Sosiologi", "Sociology"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Antropologi", "Anthropology"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Hubungan Internasional", "International Relations"],
    primary_type: "SOCIAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 85,
  },
  {
    keywords: ["Ilmu Politik", "Political Science", "Politik"],
    primary_type: "SOCIAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 85,
  },
  {
    keywords: ["Pendidikan Bahasa Inggris", "English Education"],
    primary_type: "SOCIAL",
    secondary_type: "ARTISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Fisioterapi", "Physiotherapy", "Terapi Fisik"],
    primary_type: "SOCIAL",
    secondary_type: "REALISTIC",
    compatibility_score: 85,
  },
  {
    keywords: ["Gizi", "Nutrition", "Ilmu Gizi"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  {
    keywords: ["Kesejahteraan Sosial", "Social Welfare"],
    primary_type: "SOCIAL",
    secondary_type: null,
    compatibility_score: 95,
  },

  // ========================================
  // ENTERPRISING (E) Programs
  // Ref: "leadership and public speaking abilities, interested in money and politics"
  // Examples: marketing, business, sales, hospitality management, entrepreneurship
  // ========================================
  {
    keywords: ["Manajemen", "Management"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 100,
  },
  {
    keywords: ["Ilmu Ekonomi", "Economics", "Ekonomi"],
    primary_type: "ENTERPRISING",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Ekonomi Pembangunan", "Development Economics"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Bisnis Digital", "Digital Business", "E-Business"],
    primary_type: "ENTERPRISING",
    secondary_type: "REALISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Kewirausahaan", "Entrepreneurship"],
    primary_type: "ENTERPRISING",
    secondary_type: null,
    compatibility_score: 100,
  },
  {
    keywords: ["Pemasaran", "Marketing"],
    primary_type: "ENTERPRISING",
    secondary_type: "ARTISTIC",
    compatibility_score: 90,
  },
  {
    keywords: ["Administrasi Bisnis", "Business Administration"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Administrasi Niaga", "Business Management"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Ilmu Hukum", "Law", "Hukum"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 90,
  },
  {
    keywords: ["Hubungan Masyarakat", "Public Relations", "Humas"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Perhotelan", "Hotel Management", "Hospitality"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Pariwisata", "Tourism", "Kepariwisataan"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Manajemen Retail", "Retail Management"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 85,
  },
  {
    keywords: ["Logistik", "Logistics", "Supply Chain"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
    compatibility_score: 85,
  },

  // ========================================
  // CONVENTIONAL (C) Programs
  // Ref: "clerical and math abilities, likes to work indoors and organize things"
  // Examples: bookkeeping, accounting, office manager, medical laboratory assisting
  // ========================================
  {
    keywords: ["Akuntansi", "Accounting"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 100,
  },
  {
    keywords: ["Administrasi Publik", "Public Administration"],
    primary_type: "CONVENTIONAL",
    secondary_type: "SOCIAL",
    compatibility_score: 95,
  },
  {
    keywords: ["Administrasi Perpajakan", "Tax Administration", "Perpajakan"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 95,
  },
  {
    keywords: ["Perpustakaan", "Library Science", "Ilmu Perpustakaan"],
    primary_type: "CONVENTIONAL",
    secondary_type: null,
    compatibility_score: 90,
  },
  {
    keywords: ["Arsip", "Archival Science"],
    primary_type: "CONVENTIONAL",
    secondary_type: null,
    compatibility_score: 90,
  },
  {
    keywords: ["Sekretaris", "Secretary"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 85,
  },
  {
    keywords: [
      "Manajemen Perkantoran",
      "Office Management",
      "Administrasi Perkantoran",
    ],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 85,
  },
  {
    keywords: ["Perbankan", "Banking"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 90,
  },
  {
    keywords: ["Keuangan", "Finance"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
    compatibility_score: 90,
  },
  {
    keywords: ["Audit", "Auditing"],
    primary_type: "CONVENTIONAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 90,
  },
  {
    keywords: ["Manajemen Informasi", "Information Management"],
    primary_type: "CONVENTIONAL",
    secondary_type: "REALISTIC",
    compatibility_score: 80,
  },
  {
    keywords: ["Data Science", "Ilmu Data", "Sains Data"],
    primary_type: "CONVENTIONAL",
    secondary_type: "INVESTIGATIVE",
    compatibility_score: 85,
  },
  {
    keywords: ["Manajemen Operasional", "Operations Management"],
    primary_type: "CONVENTIONAL",
    secondary_type: "REALISTIC",
    compatibility_score: 80,
  },
];

/**
 * Get the full Holland Code (3-letter code) from assessment scores
 * Example: If scores are R=45, I=40, A=35, S=30, E=25, C=20
 * Holland Code would be "RIA"
 */
export function getHollandCode(scores: {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}): string {
  const sortedTypes = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type[0].toUpperCase());

  return sortedTypes.join("");
}
