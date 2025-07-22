import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string().email("Format email tidak valid").required("Email wajib diisi"),
  password: yup.string().required("Password wajib diisi"),
});