// EduPath Color System - Patokan Warna
// File ini berfungsi sebagai referensi untuk konsistensi warna di seluruh aplikasi EduPath

export const eduPathColors = {
  // Primary Colors - Warna utama EduPath
  primary: {
    main: "#6CCBFF", // Biru utama EduPath (digunakan di sidebar, button utama)
    hover: "#4BB8FF", // Biru hover (untuk efek hover button)
    light: "#D0E5FF", // Biru muda (untuk background gradient)
    medium: "#81ABDE", // Biru medium (untuk background gradient)
    dark: "#3975BF", // Biru gelap (untuk background gradient)
  },

  // Secondary Colors - Warna sekunder
  secondary: {
    blue: "#2563eb", // Biru sekunder
    darkBlue: "#1E40AF", // Biru gelap
    navy: "#1E3A8A", // Navy
  },

  // Neutral Colors - Warna netral untuk background, text, dll
  neutral: {
    white: "#ffffff", // Putih
    light: "#f5f5f5", // Background form/halaman
    lightGray: "#F1F1F1", // Background input field
    gray: "#dcdddc", // Background button disabled/secondary
    mediumGray: "#c3c3c3", // Shadow color
    darkGray: "#757575", // Text color secondary
    black: "#000000", // Hitam
  },

  // Status Colors - Warna untuk status, alert, dll
  status: {
    success: "#059669", // Hijau sukses
    error: "#ef4444", // Merah error
    warning: "#F59E0B", // Kuning warning
    info: "#0891B2", // Biru info
  },

  // Background Patterns - Warna background yang sering digunakan
  background: {
    page: "#f5f5f5", // Background halaman utama
    card: "#ffffff", // Background card/container
    input: "#F1F1F1", // Background input field
    disabled: "#dcdddc", // Background element disabled
    overlay: "rgba(0, 0, 0, 0.5)", // Overlay modal/dropdown
  },

  // Academic Subject Colors - Warna untuk jurusan/mata kuliah
  academic: {
    teknikInformatika: "#1E40AF",
    sistemInformasi: "#8B0000",
    manajemen: "#FF00E5",
    akuntansi: "#3C3782",
    teknikSipil: "#B7D200",
    kedokteran: "#059669",
    psikologi: "#DC2626",
    hukum: "#1F2937",
    ekonomi: "#0891B2",
    arsitektur: "#7C3AED",
    teknikMesin: "#4B5563",
    farmasi: "#7C2D12",
    teknikElektro: "#991B1B",
    ilmuKomunikasi: "#7E22CE",
    desainKomunikasiVisual: "#EC4899",
    matematika: "#5B21B6",
    fisika: "#BE123C",
    kimia: "#047857",
    biologi: "#C2410C",
    sastraInggris: "#6366F1",
  },

  // University Colors - Warna untuk universitas
  university: {
    universitasIndonesia: "#B91C1C",
    institutTeknologiBandung: "#BE123C",
    universitasGadjahMada: "#C2410C",
    institutTeknologiSepuluhNopember: "#1F2937",
    universitasBinaNusantara: "#1E3A8A",
    universitasBrawijaya: "#047857",
    universitasDiponegoro: "#DC2626",
    universitasPadjadjaran: "#F59E0B",
    binaNusantara: "#1E40AF",
    universitasTrisakti: "#7C3AED",
    universitasPelitaHarapan: "#7C2D12",
    universitasTarumanagara: "#059669",
    institutPertanianBogor: "#3C3782",
    universitasSebelasMaret: "#8B0000",
    universitasHasanuddin: "#EF4444",
    universitasNegeriYogyakarta: "#B31507",
  },

  // Consultation Status Colors - Warna untuk status konseling
  consultationStatus: {
    pending: "#F59E0B", // Kuning - menunggu
    ongoing: "#0891B2", // Biru - sedang berlangsung
    completed: "#059669", // Hijau - selesai
    cancelled: "#ef4444", // Merah - dibatalkan
  },

  // Gradient Combinations - Kombinasi warna untuk gradient
  gradients: {
    // Gradient yang digunakan di halaman Konseling
    blueGradient: "linear-gradient(to bottom, #D0E5FF, #81ABDE, #3975BF)",
    // Gradient alternatif untuk button atau elemen lain
    primaryGradient: "linear-gradient(135deg, #6CCBFF, #4BB8FF)",
  },
} as const;

// Utility untuk mendapatkan warna berdasarkan status konseling
export const getConsultationStatusColor = (
  status: "pending" | "ongoing" | "completed" | "cancelled"
) => {
  const colorMap = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      hex: eduPathColors.consultationStatus.pending,
    },
    ongoing: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      hex: eduPathColors.consultationStatus.ongoing,
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-800",
      hex: eduPathColors.consultationStatus.completed,
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      hex: eduPathColors.consultationStatus.cancelled,
    },
  };

  return colorMap[status];
};

// Contoh penggunaan warna dalam komponen:
/*
// Untuk background primary:
style={{ backgroundColor: eduPathColors.primary.main }}
className="bg-primary"

// Untuk hover effect:
style={{ backgroundColor: eduPathColors.primary.hover }}
className="hover:bg-[#4BB8FF]"

// Untuk background input:
style={{ backgroundColor: eduPathColors.background.input }}
className="bg-[#F1F1F1]"

// Untuk gradient background:
style={{ background: eduPathColors.gradients.blueGradient }}
className="bg-gradient-to-b from-[#D0E5FF] via-[#81ABDE] to-[#3975BF]"
*/

export default eduPathColors;
