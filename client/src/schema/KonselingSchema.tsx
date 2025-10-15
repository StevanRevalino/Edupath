import * as yup from "yup";

export const konselingSchema = yup.object().shape({
  selectedDate: yup
    .date()
    .required("Tanggal konseling wajib dipilih")
    .test(
      "is-not-past-date",
      "Tanggal konseling tidak boleh di masa lalu",
      function (value) {
        if (!value) return true;

        // Get today's date at midnight (00:00:00)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get selected date at midnight (00:00:00)
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);

        // Allow today and future dates
        return selectedDate >= today;
      }
    ),

  selectedTimeStart: yup
    .string()
    .required("Waktu mulai wajib dipilih")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid")
    .test(
      "is-not-past-time",
      "Waktu sudah berlalu, pilih waktu yang akan datang",
      function (value) {
        const { selectedDate } = this.parent;
        if (!selectedDate || !value) return true;

        // Get selected date
        const selected = new Date(selectedDate);
        const [hours, minutes] = value.split(":").map(Number);
        selected.setHours(hours, minutes, 0, 0);

        // Get current time
        const now = new Date();

        // Must be at least 5 minutes from now
        const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

        return selected >= fiveMinutesFromNow;
      }
    ),

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

  description: yup
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .min(20, "Deskripsi minimal 20 karakter"),

  expertName: yup.string().required("Nama ahli wajib dipilih"),
});

// Type untuk form data
export type KonselingFormData = {
  selectedDate: Date;
  selectedTimeStart: string;
  selectedTimeEnd: string;
  message: string;
  description: string;
  expertName: string;
};
