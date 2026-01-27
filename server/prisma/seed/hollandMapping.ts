/**
 * Holland to Prodi (Program Studi) Mapping
 * Based on Holland's Career Environmental Typology
 * Reference: Table 4.1 Summary of Holland Types Related to Major Fields
 *
 * This mapping connects personality types with compatible academic programs
 * Each mapping includes:
 * - keywords: Array of possible prodi names (for fuzzy matching)
 * - primary_type: Main Holland type
 * - secondary_type: Secondary Holland type (optional)
 *
 * MATCHING STRATEGY:
 * Seed script will try to match using keywords with LIKE %keyword%
 * This handles variations like "Teknik Informatika" vs "Informatika"
 */

interface ProdiMapping {
  keywords: string[]; // Multiple possible names
  primary_type: string;
  secondary_type: string | null;
}

export const hollandProdiMapping: ProdiMapping[] = [
  // ========================================
  // REALISTIC (R) Programs
  // Ref: "mechanical and athletic abilities, likes to work outdoors and with tools"
  // Examples: computer engineering, forestry, surveying, etc.
  // ========================================
  {
    keywords: ["Teknik Mesin", "Mesin"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Elektro", "Elektro"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Sipil", "Sipil"],
    primary_type: "REALISTIC",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: ["Teknik Industri", "Industri"],
    primary_type: "REALISTIC",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Arsitektur", "Architecture"],
    primary_type: "REALISTIC",
    secondary_type: "ARTISTIC",
  },
  {
    keywords: [
      "Teknik Informatika",
      "Informatika",
      "Ilmu Komputer",
      "Computer Science",
      "Ilmu Informatika",
      "PJJ Teknik Informatika",
      "Pendidikan Teknik Informatika",
      "Pendidikan Ilmu Komputer",
      "Pendidikan Informatika",
    ],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: [
      "Teknik Komputer",
      "Computer Engineering",
      "Sistem Komputer",
      "Rekayasa Sistem Komputer",
    ],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: [
      "Sistem Informasi",
      "Information System",
      "Manajemen Informatika",
    ],
    primary_type: "REALISTIC",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: ["Teknik Pertanian", "Pertanian", "Agricultural Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Kimia", "Chemical Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Geologi", "Geological Engineering", "Geologi Teknik"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Lingkungan", "Environmental Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Metalurgi", "Metalurgi", "Metallurgical Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Perminyakan", "Perminyakan", "Petroleum Engineering"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknologi Pangan", "Food Technology"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Teknik Kelautan", "Kelautan", "Marine Engineering", "Ocean"],
    primary_type: "REALISTIC",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Kehutanan", "Forestry"],
    primary_type: "REALISTIC",
    secondary_type: null,
  },
  {
    keywords: ["Peternakan", "Animal Science", "Animal Husbandry"],
    primary_type: "REALISTIC",
    secondary_type: null,
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
  },
  {
    keywords: ["Farmasi", "Pharmacy", "Apoteker"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Biologi", "Biology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },
  {
    keywords: ["Kimia", "Chemistry"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },
  {
    keywords: ["Fisika", "Physics"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },
  {
    keywords: ["Matematika", "Mathematics"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },
  {
    keywords: ["Statistika", "Statistics", "Statistik"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: ["Psikologi", "Psychology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Bioteknologi", "Biotechnology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Kedokteran Gigi", "Dentistry", "Pendidikan Dokter Gigi"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Kedokteran Hewan", "Veterinary"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Geofisika", "Geophysics", "Geologi", "Geology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Mikrobiologi", "Microbiology"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },
  {
    keywords: ["Astronomi", "Astronomy"],
    primary_type: "INVESTIGATIVE",
    secondary_type: null,
  },

  // ========================================
  // ARTISTIC (A) Programs
  // Ref: "artistic skills, enjoys creating original work"
  // Examples: composer, music, stage director, writer, interior decoration, acting
  // ========================================
  {
    keywords: ["Desain Grafis", "Graphic Design"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Desain Interior", "Interior Design", "Desain Ruang"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
  },
  {
    keywords: [
      "Desain Komunikasi Visual",
      "DKV",
      "Visual Communication Design",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Desain Produk", "Product Design"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Seni Rupa", "Fine Arts"],
    primary_type: "ARTISTIC",
    secondary_type: null,
  },
  {
    keywords: ["Seni Musik", "Music", "Musik"],
    primary_type: "ARTISTIC",
    secondary_type: null,
  },
  {
    keywords: ["Seni Tari", "Dance", "Tari"],
    primary_type: "ARTISTIC",
    secondary_type: null,
  },
  {
    keywords: ["Seni Teater", "Theater", "Theatre"],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Kriya", "Craft", "Seni Kriya"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
  },
  {
    keywords: [
      "Sastra Indonesia",
      "Indonesian Literature",
      "Bahasa dan Sastra Indonesia",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
  },
  {
    keywords: [
      "Sastra Inggris",
      "English Literature",
      "Bahasa dan Sastra Inggris",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
  },
  {
    keywords: [
      "Ilmu Komunikasi",
      "Communication",
      "Komunikasi",
      "Communication Science",
      "Komunikasi Penyiaran Islam",
      "Komunikasi Dan Penyiaran Islam",
      "Manajemen Komunikasi",
      "Komunikasi Terapan",
    ],
    primary_type: "ARTISTIC",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Film dan Televisi", "Film", "Broadcasting", "Television"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Periklanan", "Advertising"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Fotografi", "Photography"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Fashion Design", "Desain Fashion", "Desain Mode"],
    primary_type: "ARTISTIC",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Animasi", "Animation"],
    primary_type: "ARTISTIC",
    secondary_type: "REALISTIC",
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
  },
  {
    keywords: [
      "Pendidikan Guru Sekolah Dasar",
      "PGSD",
      "Primary Teacher Education",
    ],
    primary_type: "SOCIAL",
    secondary_type: null,
  },
  {
    keywords: [
      "Bimbingan dan Konseling",
      "Guidance and Counseling",
      "Konseling",
    ],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Ilmu Keperawatan", "Nursing", "Keperawatan", "Ners"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Kesehatan Masyarakat", "Public Health"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Pekerjaan Sosial", "Social Work"],
    primary_type: "SOCIAL",
    secondary_type: null,
  },
  {
    keywords: ["Sosiologi", "Sociology"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Antropologi", "Anthropology"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Hubungan Internasional", "International Relations"],
    primary_type: "SOCIAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Ilmu Politik", "Political Science", "Politik"],
    primary_type: "SOCIAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Pendidikan Bahasa Inggris", "English Education"],
    primary_type: "SOCIAL",
    secondary_type: "ARTISTIC",
  },
  {
    keywords: ["Fisioterapi", "Physiotherapy", "Terapi Fisik"],
    primary_type: "SOCIAL",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Gizi", "Nutrition", "Ilmu Gizi"],
    primary_type: "SOCIAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Kesejahteraan Sosial", "Social Welfare"],
    primary_type: "SOCIAL",
    secondary_type: null,
  },

  // ========================================
  // ENTERPRISING (E) Programs
  // Ref: "leadership and public speaking abilities, interested in money and politics"
  // Examples: marketing, business, sales, hospitality management, entrepreneurship
  // ========================================
  {
    keywords: [
      "Manajemen",
      "Management",
      "Manajemen Bisnis",
      "Business Management",
      "Manajemen Bisnis Syariah",
      "Manajemen Dakwah",
      "Manajemen Zakat Dan Wakaf",
      "Manajemen Haji Dan Umroh",
    ],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: [
      "Ilmu Ekonomi",
      "Economics",
      "Ekonomi",
      "Ekonomi Syariah",
      "Ekonomi Syari'ah",
      "Ekonomi Syari`ah",
    ],
    primary_type: "ENTERPRISING",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Ekonomi Pembangunan", "Development Economics"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
  },
  {
    keywords: [
      "Agribisnis",
      "Agribusiness",
      "Agrobisnis",
      "Agrobisnis Perikanan",
    ],
    primary_type: "ENTERPRISING",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Bisnis Digital", "Digital Business", "E-Business"],
    primary_type: "ENTERPRISING",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Kewirausahaan", "Entrepreneurship"],
    primary_type: "ENTERPRISING",
    secondary_type: null,
  },
  {
    keywords: ["Pemasaran", "Marketing"],
    primary_type: "ENTERPRISING",
    secondary_type: "ARTISTIC",
  },
  {
    keywords: [
      "Administrasi Bisnis",
      "Business Administration",
      "Administrasi Niaga",
      "Ilmu Administrasi Niaga",
      "Business Management",
    ],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: ["Ilmu Hukum", "Law", "Hukum"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Hubungan Masyarakat", "Public Relations", "Humas"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Perhotelan", "Hotel Management", "Hospitality"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Pariwisata", "Tourism", "Kepariwisataan"],
    primary_type: "ENTERPRISING",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Manajemen Retail", "Retail Management"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
  },
  {
    keywords: ["Logistik", "Logistics", "Supply Chain"],
    primary_type: "ENTERPRISING",
    secondary_type: "CONVENTIONAL",
  },

  // ========================================
  // CONVENTIONAL (C) Programs
  // Ref: "clerical and math abilities, likes to work indoors and organize things"
  // Examples: bookkeeping, accounting, office manager, medical laboratory assisting
  // ========================================
  {
    keywords: [
      "Akuntansi",
      "Accounting",
      "Akuntansi Bisnis",
      "Akuntansi Syariah",
      "Komputerisasi Akuntansi",
      "PJJ Akuntansi",
      "Pendidikan Akuntansi",
    ],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Administrasi Publik", "Public Administration"],
    primary_type: "CONVENTIONAL",
    secondary_type: "SOCIAL",
  },
  {
    keywords: ["Administrasi Perpajakan", "Tax Administration", "Perpajakan"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Perpustakaan", "Library Science", "Ilmu Perpustakaan"],
    primary_type: "CONVENTIONAL",
    secondary_type: null,
  },
  {
    keywords: ["Arsip", "Archival Science"],
    primary_type: "CONVENTIONAL",
    secondary_type: null,
  },
  {
    keywords: ["Sekretaris", "Secretary"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: [
      "Manajemen Perkantoran",
      "Office Management",
      "Administrasi Perkantoran",
    ],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Perbankan", "Banking"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Keuangan", "Finance"],
    primary_type: "CONVENTIONAL",
    secondary_type: "ENTERPRISING",
  },
  {
    keywords: ["Audit", "Auditing"],
    primary_type: "CONVENTIONAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Manajemen Informasi", "Information Management"],
    primary_type: "CONVENTIONAL",
    secondary_type: "REALISTIC",
  },
  {
    keywords: ["Data Science", "Ilmu Data", "Sains Data"],
    primary_type: "CONVENTIONAL",
    secondary_type: "INVESTIGATIVE",
  },
  {
    keywords: ["Manajemen Operasional", "Operations Management"],
    primary_type: "CONVENTIONAL",
    secondary_type: "REALISTIC",
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
