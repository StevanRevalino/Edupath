import * as yup from "yup";

export const resetPasswordSchema = (isEmailVerified: boolean) =>
  yup.object().shape({
    email: yup
      .string()
      .email("Format email tidak valid")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email harus memiliki domain yang valid (contoh: user@gmail.com)"
      )
      .required("Email wajib diisi")
      .test("is-verified", "Email belum diverifikasi", () => isEmailVerified),
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

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Format email tidak valid")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email harus memiliki domain yang valid (contoh: user@gmail.com)"
    )
    .required("Email wajib diisi"),
});
