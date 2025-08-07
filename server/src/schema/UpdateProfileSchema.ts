// Interface untuk update profil data
export interface UpdateProfileData {
  firstname?: string;
  lastname?: string;
  kelas?: number;
}

// Validasi sederhana untuk backend (karena frontend sudah pakai Yup)
export const validateUpdateProfile = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validasi basic type checking saja
  if (data.firstname !== undefined && typeof data.firstname !== "string") {
    errors.push("Nama depan harus berupa teks");
  }

  if (data.lastname !== undefined && typeof data.lastname !== "string") {
    errors.push("Nama belakang harus berupa teks");
  }

  // Validasi kelas tetap ketat di backend untuk security
  if (data.kelas !== undefined) {
    const kelasNum = Number(data.kelas);
    if (isNaN(kelasNum) || ![10, 11, 12].includes(kelasNum)) {
      errors.push("Kelas harus 10, 11, atau 12");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
