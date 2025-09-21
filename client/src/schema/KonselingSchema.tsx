import * as yup from "yup";

export const konselingSchema = yup.object().shape({
  selectedDate: yup
    .date()
    .required("Tanggal konseling wajib dipilih")
    .min(new Date(), "Tanggal konseling tidak boleh di masa lalu"),

  selectedTimeStart: yup
    .string()
    .required("Waktu mulai wajib dipilih")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid"),

  selectedTimeEnd: yup
    .string()
    .required("Waktu selesai wajib dipilih")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid")
    .test(
      "is-after-start-time",
      "Waktu selesai harus setelah waktu mulai",
      function (value) {
        const { selectedTimeStart } = this.parent;
        if (!selectedTimeStart || !value) return true;

        const [startHour, startMinute] = selectedTimeStart
          .split(":")
          .map(Number);
        const [endHour, endMinute] = value.split(":").map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        return endTime > startTime;
      }
    ),

  message: yup
    .string()
    .required("Topik konseling wajib diisi")
    .max(50, "Topik maksimal 50 karakter"),

  notes: yup.string().max(500, "Deskripsi maksimal 500 karakter").min(20, "Deskripsi minimal 20 karakter"),

  expertName: yup.string().required("Nama ahli wajib dipilih"),
});

// Type untuk form data
export type KonselingFormData = {
  selectedDate: Date;
  selectedTimeStart: string;
  selectedTimeEnd: string;
  message: string;
  notes: string;
  expertName: string;
};
