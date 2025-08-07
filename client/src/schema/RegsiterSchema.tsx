import * as yup from "yup";

// Function yang mengembalikan email validation chain untuk memastikan urutan benar
const createEmailValidation = () =>
  yup
    .string()
    .required("Email wajib diisi")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Format email tidak valid (contoh: user@gmail.com)"
    );

export const registerSchema = yup.object().shape({
  firstName: yup.string().required("Nama awal wajib diisi"),
  lastName: yup.string().required("Nama akhir wajib diisi"),
  kelas: yup.string().required("Kelas wajib dipilih"),
  email: createEmailValidation(),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter")
    .matches(/[a-zA-Z]/, "Password harus mengandung huruf")
    .matches(/\d/, "Password harus mengandung angka"),
  confirmPassword: yup
    .string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([yup.ref("password")], "Password tidak cocok"),
});

export const emailSchema = yup.object().shape({
  email: createEmailValidation(),
});
