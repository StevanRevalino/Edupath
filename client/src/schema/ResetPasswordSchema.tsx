import * as yup from "yup";

// Yup schema untuk reset password
export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  newPassword: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter")
    .matches(/[a-zA-Z]/, "Password harus mengandung huruf")
    .matches(/\d/, "Password harus mengandung angka"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Konfirmasi password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
});
