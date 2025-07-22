import * as yup from "yup";

export const registerSchema = yup.object().shape({
  firstName: yup.string().required("Nama awal wajib diisi"),
  lastName: yup.string().required("Nama akhir wajib diisi"),
  kelas: yup.string().required("Kelas wajib dipilih"),
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
  confirmPassword: yup
    .string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([yup.ref("password")], "Password tidak cocok"),
});
