import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Format email tidak valid")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email harus memiliki domain yang valid (contoh: user@gmail.com)"
    )
    .required("Email wajib diisi"),
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});
