import { useState } from "react";
import FormatPertanyaan from "./Components/FormatPertanyaan";
import Pagination from "./Components/Pagination";
import { useNavigate } from "react-router-dom";

const DummyQuestions = [
  // Text type questions
  {
    id: "q1",
    type: "text" as const,
    questionText: "Bagaimana cara Anda biasanya belajar konsep baru?",
    options: [
      { id: "opt1", text: "Membaca buku" },
      { id: "opt2", text: "Menonton video" },
      { id: "opt3", text: "Praktik langsung" },
      { id: "opt4", text: "Diskusi kelompok" },
    ],
  },
  {
    id: "q2",
    type: "text" as const,
    questionText: "Kapan waktu terbaik Anda untuk belajar?",
    options: [
      { id: "opt1", text: "Pagi hari" },
      { id: "opt2", text: "Siang hari" },
      { id: "opt3", text: "Sore hari" },
      { id: "opt4", text: "Malam hari" },
    ],
  },
  {
    id: "q3",
    type: "text" as const,
    questionText: "Metode pembelajaran mana yang paling efektif untuk Anda?",
    options: [
      { id: "opt1", text: "Visual" },
      { id: "opt2", text: "Audio" },
      { id: "opt3", text: "Kinestetik" },
      { id: "opt4", text: "Reading/Writing" },
    ],
  },
  {
    id: "q4",
    type: "text" as const,
    questionText: "Bagaimana Anda mengatur jadwal belajar?",
    options: [
      { id: "opt1", text: "Rutin harian" },
      { id: "opt2", text: "Mingguan" },
      { id: "opt3", text: "Menjelang ujian" },
      { id: "opt4", text: "Tidak teratur" },
    ],
  },
  {
    id: "q5",
    type: "text" as const,
    questionText: "Media pembelajaran mana yang Anda sukai?",
    options: [
      { id: "opt1", text: "E-book" },
      { id: "opt2", text: "Video tutorial" },
      { id: "opt3", text: "Podcast" },
      { id: "opt4", text: "Interactive quiz" },
    ],
  },

  // Yes/No questions
  {
    id: "q6",
    type: "yesno" as const,
    questionText: "Apakah Anda suka belajar dalam kelompok?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q7",
    type: "yesno" as const,
    questionText: "Apakah Anda mudah terdistraksi saat belajar?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q8",
    type: "yesno" as const,
    questionText: "Apakah Anda lebih suka belajar dengan musik?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q9",
    type: "yesno" as const,
    questionText: "Apakah Anda membutuhkan deadline untuk memotivasi belajar?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q10",
    type: "yesno" as const,
    questionText: "Apakah Anda suka mencatat saat belajar?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },

  // Likert scale questions
  {
    id: "q11",
    type: "likert" as const,
    questionText: "Saya lebih suka belajar sendiri daripada berkelompok.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q12",
    type: "likert" as const,
    questionText:
      "Saya mudah memahami materi yang dijelaskan dengan diagram atau gambar.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q13",
    type: "likert" as const,
    questionText:
      "Saya perlu lingkungan yang tenang untuk belajar dengan efektif.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q14",
    type: "likert" as const,
    questionText: "Saya lebih suka belajar dengan cara praktik langsung.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q15",
    type: "likert" as const,
    questionText: "Saya mudah mengingat informasi yang saya dengar.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q16",
    type: "likert" as const,
    questionText: "Saya suka menggunakan teknologi dalam proses pembelajaran.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q17",
    type: "likert" as const,
    questionText:
      "Saya dapat belajar dengan baik dalam waktu yang lama tanpa istirahat.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q18",
    type: "likert" as const,
    questionText:
      "Saya lebih memahami konsep ketika dijelaskan dengan contoh nyata.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q19",
    type: "likert" as const,
    questionText: "Saya suka membuat mind map atau diagram saat belajar.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q20",
    type: "likert" as const,
    questionText: "Saya lebih suka belajar dengan sistem try and error.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },

  // Mixed additional questions
  {
    id: "q21",
    type: "text" as const,
    questionText: "Berapa lama durasi belajar yang ideal untuk Anda?",
    options: [
      { id: "opt1", text: "15-30 menit" },
      { id: "opt2", text: "30-60 menit" },
      { id: "opt3", text: "1-2 jam" },
      { id: "opt4", text: "Lebih dari 2 jam" },
    ],
  },
  {
    id: "q22",
    type: "yesno" as const,
    questionText: "Apakah Anda suka mengulang materi yang sudah dipelajari?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q23",
    type: "likert" as const,
    questionText: "Saya mudah memahami instruksi tertulis.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q24",
    type: "text" as const,
    questionText: "Bagaimana cara Anda mengingat informasi penting?",
    options: [
      { id: "opt1", text: "Menulis catatan" },
      { id: "opt2", text: "Mengulang verbal" },
      { id: "opt3", text: "Membuat asosiasi" },
      { id: "opt4", text: "Praktik berulang" },
    ],
  },
  {
    id: "q25",
    type: "yesno" as const,
    questionText: "Apakah Anda suka belajar dengan sistem kompetisi?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q26",
    type: "likert" as const,
    questionText: "Saya belajar lebih baik ketika ada reward atau penghargaan.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q27",
    type: "text" as const,
    questionText: "Platform pembelajaran online mana yang Anda sukai?",
    options: [
      { id: "opt1", text: "Video interaktif" },
      { id: "opt2", text: "Gamifikasi" },
      { id: "opt3", text: "Forum diskusi" },
      { id: "opt4", text: "Live streaming" },
    ],
  },
  {
    id: "q28",
    type: "yesno" as const,
    questionText: "Apakah Anda mudah kehilangan fokus saat belajar online?",
    options: [
      { id: "opt1", text: "Ya" },
      { id: "opt2", text: "Tidak" },
    ],
  },
  {
    id: "q29",
    type: "likert" as const,
    questionText: "Saya lebih suka feedback yang detail dan konstruktif.",
    options: [
      { id: "opt1", text: "Sangat tidak setuju" },
      { id: "opt2", text: "" },
      { id: "opt3", text: "" },
      { id: "opt4", text: "" },
      { id: "opt5", text: "Sangat setuju" },
    ],
  },
  {
    id: "q30",
    type: "text" as const,
    questionText: "Bagaimana Anda mengukur keberhasilan pembelajaran Anda?",
    options: [
      { id: "opt1", text: "Nilai ujian" },
      { id: "opt2", text: "Pemahaman konsep" },
      { id: "opt3", text: "Kemampuan aplikasi" },
      { id: "opt4", text: "Feedback orang lain" },
    ],
  },
];

interface Answer {
  questionId: string;
  selectedOption: string;
}

export default function PertanyaanTes() {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  const navigate = useNavigate();

  // Calculate pagination
  const totalPages = Math.ceil(DummyQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = DummyQuestions.slice(startIndex, endIndex);

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, selectedOption: optionId };
        return updated;
      } else {
        return [...prev, { questionId, selectedOption: optionId }];
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLastPage = currentPage === totalPages;
  const allQuestionsAnswered = answers.length === DummyQuestions.length;

  return (
    <>
      <div className="top-6 left-6 z-0 pl-5 pt-5">
        <button
          onClick={() => navigate("/tes")}
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
        >
          <span className="text-lg font-medium">&lt;&lt;</span>
          <span className="font-medium underline">Kembali</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-5 -mb-24">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Tes Gaya Belajar - Halaman {currentPage} dari {totalPages}
        </h1>

        {/* Questions */}
        {currentQuestions.map((question, index) => (
          <FormatPertanyaan
            key={question.id}
            questionNumber={startIndex + index + 1}
            questionText={question.questionText}
            questionType={question.type}
            options={question.options}
            selectedAnswer={
              answers.find((a) => a.questionId === question.id)?.selectedOption
            }
            onAnswerChange={(optionId) =>
              handleAnswerChange(question.id, optionId)
            }
          />
        ))}

        {/* Pagination */}
        <div className="mt-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Submit Button - Only show on last page */}
        {isLastPage && (
          <div className="flex justify-center mt-10">
            <button
              className={`font-medium py-3 px-8 rounded-3xl transition-colors ${
                allQuestionsAnswered
                  ? "bg-[#3FBBFE] hover:bg-[#3FA9F5] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!allQuestionsAnswered}
              onClick={() => navigate("/tes/selesai")}
            >
              {allQuestionsAnswered
                ? `Selesai`
                : `Jawab Semua Pertanyaan (${answers.length}/${DummyQuestions.length})`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
