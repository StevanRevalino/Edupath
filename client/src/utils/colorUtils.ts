// Helper function to generate color for any string
export const getColorForString = (str: string): string => {
  // Predefined colors for common majors and universities
  const predefinedColors: Record<string, string> = {
    // Common majors colors
    "Teknik Informatika": "bg-[#1E40AF]",
    "Sistem Informasi": "bg-[#8B0000]",
    Manajemen: "bg-[#FF00E5]",
    Akuntansi: "bg-[#3C3782]",
    "Teknik Sipil": "bg-[#B7D200]",
    Kedokteran: "bg-[#059669]",
    Psikologi: "bg-[#DC2626]",
    Hukum: "bg-[#1F2937]",
    Ekonomi: "bg-[#0891B2]",
    Arsitektur: "bg-[#7C3AED]",
    "Teknik Mesin": "bg-[#4B5563]",
    Farmasi: "bg-[#7C2D12]",
    "Teknik Elektro": "bg-[#991B1B]",
    "Ilmu Komunikasi": "bg-[#7E22CE]",
    "Desain Komunikasi Visual": "bg-[#EC4899]",
    Matematika: "bg-[#5B21B6]",
    Fisika: "bg-[#BE123C]",
    Kimia: "bg-[#047857]",
    Biologi: "bg-[#C2410C]",
    "Sastra Inggris": "bg-[#6366F1]",

    // Universities colors
    "Universitas Indonesia": "bg-[#B91C1C]",
    "Institut Teknologi Bandung": "bg-[#BE123C]",
    "Universitas Gadjah Mada": "bg-[#C2410C]",
    "Institut Teknologi Sepuluh Nopember": "bg-[#1F2937]",
    "Universitas Bina Nusantara": "bg-[#1E3A8A]",
    "Universitas Brawijaya": "bg-[#047857]",
    "Universitas Diponegoro": "bg-[#DC2626]",
    "Universitas Padjadjaran": "bg-[#F59E0B]",
    "Bina Nusantara": "bg-[#1E40AF]",
    "Universitas Trisakti": "bg-[#7C3AED]",
    "Universitas Pelita Harapan": "bg-[#7C2D12]",
    "Universitas Tarumanagara": "bg-[#059669]",
    "Institut Pertanian Bogor": "bg-[#3C3782]",
    "Universitas Sebelas Maret": "bg-[#8B0000]",
    "Universitas Hasanuddin": "bg-[#EF4444]",
    "Universitas Negeri Yogyakarta": "bg-[#B31507]",
    "Universitas Sumatera Utara": "bg-[#00B7F3]",
    "Universitas Andalas": "bg-[#FF00E5]",
    "Universitas Riau": "bg-[#F0544F]",
    "Universitas Lampung": "bg-[#10B981]",
  };

  // Return predefined color if exists
  if (predefinedColors[str]) {
    return predefinedColors[str];
  }

  // Generate color based on string hash
  const colors = [
    "bg-[#1E40AF]",
    "bg-[#8B0000]",
    "bg-[#FF00E5]",
    "bg-[#3C3782]",
    "bg-[#B7D200]",
    "bg-[#059669]",
    "bg-[#DC2626]",
    "bg-[#1F2937]",
    "bg-[#0891B2]",
    "bg-[#7C3AED]",
    "bg-[#4B5563]",
    "bg-[#7C2D12]",
    "bg-[#991B1B]",
    "bg-[#7E22CE]",
    "bg-[#EC4899]",
    "bg-[#5B21B6]",
    "bg-[#BE123C]",
    "bg-[#047857]",
    "bg-[#C2410C]",
    "bg-[#6366F1]",
  ];

  // Simple hash function to generate consistent color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};
