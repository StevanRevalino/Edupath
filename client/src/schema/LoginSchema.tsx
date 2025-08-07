import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email wajib diisi")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Format email tidak valid (contoh: user@gmail.com)"
    ),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});
