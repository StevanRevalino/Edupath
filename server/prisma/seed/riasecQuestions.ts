/**
 * RIASEC Assessment Questions
 * Based on Holland's RIASEC Hexagon Theory
 * Reference: Dictionary of Holland Occupational Codes (3rd ed.)
 * by G. D. Gottfredson & J. L. Holland, 1982, 1989, 1996
 *
 * Total: 60 questions (10 per RIASEC type)
 * Each question measures different dimensions:
 * - activities: Preferences for activities and occupations
 * - value: Personal values and what they see as important
 * - self_perception: How they see themselves
 * - environment: What kind of environment they prefer
 */

export const riasecQuestions = [
  // ========================================
  // REALISTIC (R) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang bekerja dengan alat-alat mekanik, mesin, atau peralatan teknis.",
    riasec_type: "REALISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Saya lebih suka pekerjaan yang melibatkan aktivitas fisik daripada duduk di meja sepanjang hari.",
    riasec_type: "REALISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik untuk memperbaiki atau merakit barang-barang dengan tangan saya sendiri.",
    riasec_type: "REALISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Saya menganggap pencapaian yang nyata dan berwujud lebih penting daripada ide-ide abstrak.",
    riasec_type: "REALISTIC",
    dimension: "value",
  },
  {
    question_text:
      "Saya lebih menghargai hadiah atau penghargaan yang bisa saya lihat atau gunakan secara langsung.",
    riasec_type: "REALISTIC",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang praktis dan memiliki keterampilan manual yang baik.",
    riasec_type: "REALISTIC",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya merasa nyaman bekerja dengan hal-hal konkret daripada konsep teoritis.",
    riasec_type: "REALISTIC",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di lingkungan outdoor atau bengkel daripada di kantor.",
    riasec_type: "REALISTIC",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari pekerjaan yang membutuhkan banyak interaksi sosial.",
    riasec_type: "REALISTIC",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang bekerja dengan benda-benda seperti kendaraan, tanaman, atau material bangunan.",
    riasec_type: "REALISTIC",
    dimension: "activity",
  },

  // ========================================
  // INVESTIGATIVE (I) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang melakukan eksperimen dan penelitian untuk memahami bagaimana sesuatu bekerja.",
    riasec_type: "INVESTIGATIVE",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik untuk menganalisis data dan memecahkan masalah yang kompleks.",
    riasec_type: "INVESTIGATIVE",
    dimension: "activity",
  },
  {
    question_text:
      "Saya suka membaca jurnal ilmiah atau artikel tentang penemuan baru dalam sains dan teknologi.",
    riasec_type: "INVESTIGATIVE",
    dimension: "activity",
  },
  {
    question_text:
      "Bagi saya, mengembangkan pengetahuan dan pemahaman lebih penting daripada uang atau status sosial.",
    riasec_type: "INVESTIGATIVE",
    dimension: "value",
  },
  {
    question_text:
      "Saya sangat menghargai pembelajaran dan penemuan hal-hal baru melalui riset.",
    riasec_type: "INVESTIGATIVE",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang analitis, intelektual, dan skeptis.",
    riasec_type: "INVESTIGATIVE",
    dimension: "self_perception",
  },
  {
    question_text:
      "Orang-orang sering mengatakan bahwa saya memiliki bakat akademik yang kuat.",
    riasec_type: "INVESTIGATIVE",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di laboratorium atau lingkungan riset yang tenang.",
    riasec_type: "INVESTIGATIVE",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari aktivitas yang melibatkan penjualan atau persuasi orang lain.",
    riasec_type: "INVESTIGATIVE",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang memahami fenomena alam dan sosial melalui observasi sistematis.",
    riasec_type: "INVESTIGATIVE",
    dimension: "activity",
  },

  // ========================================
  // ARTISTIC (A) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang menciptakan karya seni, musik, atau tulisan yang orisinal.",
    riasec_type: "ARTISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Saya lebih suka pekerjaan yang memungkinkan saya mengekspresikan kreativitas dan imajinasi.",
    riasec_type: "ARTISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik pada aktivitas yang melibatkan desain, pertunjukan, atau penulisan kreatif.",
    riasec_type: "ARTISTIC",
    dimension: "activity",
  },
  {
    question_text:
      "Bagi saya, ekspresi kreatif dan kebebasan berimajinasi sangat penting dalam hidup.",
    riasec_type: "ARTISTIC",
    dimension: "value",
  },
  {
    question_text:
      "Saya menghargai keindahan estetika dan nilai artistik lebih dari hal-hal praktis.",
    riasec_type: "ARTISTIC",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang terbuka terhadap pengalaman baru dan inovatif.",
    riasec_type: "ARTISTIC",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya merasa saya memiliki bakat dalam bidang seni atau intelektual yang kreatif.",
    riasec_type: "ARTISTIC",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di lingkungan yang tidak terlalu terstruktur dan memberikan kebebasan kreatif.",
    riasec_type: "ARTISTIC",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari rutinitas dan aturan yang kaku dalam bekerja.",
    riasec_type: "ARTISTIC",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang mengeksplorasi ide-ide baru melalui seni visual, musik, atau sastra.",
    riasec_type: "ARTISTIC",
    dimension: "activity",
  },

  // ========================================
  // SOCIAL (S) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang membantu orang lain mengatasi masalah pribadi atau mengembangkan potensi mereka.",
    riasec_type: "SOCIAL",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik untuk mengajar, melatih, atau membimbing orang lain.",
    riasec_type: "SOCIAL",
    dimension: "activity",
  },
  {
    question_text:
      "Saya lebih suka bekerja dalam tim dan berinteraksi dengan banyak orang.",
    riasec_type: "SOCIAL",
    dimension: "activity",
  },
  {
    question_text:
      "Bagi saya, membantu kesejahteraan orang lain dan memberikan pelayanan sosial sangat berarti.",
    riasec_type: "SOCIAL",
    dimension: "value",
  },
  {
    question_text:
      "Saya sangat menghargai hubungan interpersonal dan kepedulian terhadap sesama.",
    riasec_type: "SOCIAL",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang empatik, sabar, dan memiliki keterampilan interpersonal yang baik.",
    riasec_type: "SOCIAL",
    dimension: "self_perception",
  },
  {
    question_text:
      "Orang-orang sering datang kepada saya untuk meminta nasihat atau dukungan emosional.",
    riasec_type: "SOCIAL",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di lingkungan yang fokus pada pelayanan dan interaksi dengan orang lain.",
    riasec_type: "SOCIAL",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari pekerjaan yang bersifat mekanis atau teknis tanpa interaksi manusia.",
    riasec_type: "SOCIAL",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang berkontribusi pada komunitas melalui konseling, pengajaran, atau pekerjaan sosial.",
    riasec_type: "SOCIAL",
    dimension: "activity",
  },

  // ========================================
  // ENTERPRISING (E) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang memimpin proyek dan membujuk orang lain untuk mengikuti visi saya.",
    riasec_type: "ENTERPRISING",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik pada aktivitas yang melibatkan penjualan, negosiasi, atau persuasi.",
    riasec_type: "ENTERPRISING",
    dimension: "activity",
  },
  {
    question_text:
      "Saya lebih suka pekerjaan yang memberikan kesempatan untuk mempengaruhi dan mengarahkan orang lain.",
    riasec_type: "ENTERPRISING",
    dimension: "activity",
  },
  {
    question_text:
      "Bagi saya, mencapai kesuksesan material dan status sosial yang tinggi sangat penting.",
    riasec_type: "ENTERPRISING",
    dimension: "value",
  },
  {
    question_text:
      "Saya sangat menghargai pencapaian dalam bisnis dan kekuasaan dalam organisasi.",
    riasec_type: "ENTERPRISING",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang memiliki kemampuan penjualan dan persuasi yang kuat.",
    riasec_type: "ENTERPRISING",
    dimension: "self_perception",
  },
  {
    question_text:
      "Orang-orang sering mengatakan bahwa saya energetik dan ambisius.",
    riasec_type: "ENTERPRISING",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di lingkungan bisnis yang kompetitif dan dinamis.",
    riasec_type: "ENTERPRISING",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari pekerjaan yang bersifat ilmiah atau membutuhkan banyak riset mendalam.",
    riasec_type: "ENTERPRISING",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang mengambil risiko dalam bisnis untuk mencapai tujuan finansial atau organisasi.",
    riasec_type: "ENTERPRISING",
    dimension: "activity",
  },

  // ========================================
  // CONVENTIONAL (C) - 10 Questions
  // ========================================
  {
    question_text:
      "Saya senang mengorganisir data dan informasi dengan cara yang sistematis dan teratur.",
    riasec_type: "CONVENTIONAL",
    dimension: "activity",
  },
  {
    question_text:
      "Saya lebih suka pekerjaan yang mengikuti prosedur dan standar yang jelas.",
    riasec_type: "CONVENTIONAL",
    dimension: "activity",
  },
  {
    question_text:
      "Saya tertarik pada pekerjaan administrasi, akuntansi, atau manajemen data.",
    riasec_type: "CONVENTIONAL",
    dimension: "activity",
  },
  {
    question_text:
      "Bagi saya, keteraturan, presisi, dan efisiensi sangat penting dalam bekerja.",
    riasec_type: "CONVENTIONAL",
    dimension: "value",
  },
  {
    question_text:
      "Saya sangat menghargai stabilitas dan keamanan dalam pekerjaan.",
    riasec_type: "CONVENTIONAL",
    dimension: "value",
  },
  {
    question_text:
      "Saya menganggap diri saya sebagai orang yang teliti dan memiliki keterampilan teknis dalam produksi atau bisnis.",
    riasec_type: "CONVENTIONAL",
    dimension: "self_perception",
  },
  {
    question_text:
      "Orang-orang sering mengatakan bahwa saya sangat terorganisir dan dapat diandalkan.",
    riasec_type: "CONVENTIONAL",
    dimension: "self_perception",
  },
  {
    question_text:
      "Saya lebih suka bekerja di lingkungan yang terstruktur dengan tugas-tugas yang dapat diprediksi.",
    riasec_type: "CONVENTIONAL",
    dimension: "environment",
  },
  {
    question_text:
      "Saya cenderung menghindari situasi yang ambigu atau tidak terstruktur.",
    riasec_type: "CONVENTIONAL",
    dimension: "environment",
  },
  {
    question_text:
      "Saya senang bekerja dengan angka, dokumen, dan sistem yang membutuhkan ketelitian tinggi.",
    riasec_type: "CONVENTIONAL",
    dimension: "activity",
  },
];
