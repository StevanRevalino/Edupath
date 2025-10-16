import * as yup from "yup";

export const beasiswaSchema = yup.object().shape({
  title: yup
    .string()
    .required("Judul beasiswa harus diisi")
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Judul maksimal 200 karakter")
    .trim(),

  link: yup
    .string()
    .required("Link harus diisi")
    .url("Link harus berupa URL yang valid (contoh: https://example.com)")
    .trim(),

  image_url: yup.string().when("$isEdit", {
    is: false,
    then: (schema) => schema.required("Gambar harus diupload"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export type BeasiswaFormData = yup.InferType<typeof beasiswaSchema>;
