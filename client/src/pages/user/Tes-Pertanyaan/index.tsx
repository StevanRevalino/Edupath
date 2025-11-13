import { useState, useEffect, useRef } from "react";
import FormatPertanyaan from "./Components/FormatPertanyaan";
import Pagination from "./Components/Pagination";
import { useNavigate } from "react-router-dom";
import {
  getQuestions,
  submitAssessment,
} from "../../../services/riasecService";
import type { RiasecQuestion, RiasecResponse } from "../../../types/riasec";
import LoadingSpinner from "../../../components/LoadingSpinner";

// Likert scale options (1-5)
const LIKERT_OPTIONS = [
  { id: "1", text: "Sangat Tidak Setuju" },
  { id: "2", text: "Tidak Setuju" },
  { id: "3", text: "Netral" },
  { id: "4", text: "Setuju" },
  { id: "5", text: "Sangat Setuju" },
];

const QUESTIONS_PER_PAGE = 10;

const TesPertanyaan = () => {
  const navigate = useNavigate();
  const topRef = useRef<HTMLDivElement>(null);
  const [questions, setQuestions] = useState<RiasecQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getQuestions();
      // Acak urutan pertanyaan
      const shuffledData = shuffleArray(data);
      setQuestions(shuffledData);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pertanyaan");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answerValue: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, parseInt(answerValue));
    setAnswers(newAnswers);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Scroll to top using ref for more reliable scrolling
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Fallback methods
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Also scroll the main container if it exists
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  };

  const handleSubmit = async () => {
    if (answers.size !== questions.length) {
      alert("Mohon jawab semua pertanyaan terlebih dahulu");
      return;
    }

    try {
      setSubmitting(true);

      // Convert Map to array of responses
      const responses: RiasecResponse[] = Array.from(answers.entries()).map(
        ([question_id, answer_value]) => ({
          question_id,
          answer_value,
        })
      );

      // Submit to backend
      const result = await submitAssessment(responses);

      // Navigate to hasil page with assessment_id
      navigate(`/tes/hasil/${result.assessment_id}`, { state: { result } });
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err.message || "Gagal submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentQuestions = questions.slice(startIndex, endIndex);
  const isLastPage = currentPage === totalPages;
  const allQuestionsAnswered = answers.size === questions.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Scroll anchor */}
      <div ref={topRef} />

      {/* Back button */}
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Tes Minat & Bakat Karier
          </h1>
          <p className="text-gray-600">
            Halaman {currentPage} dari {totalPages} • Pertanyaan{" "}
            {startIndex + 1}-{Math.min(endIndex, questions.length)} dari{" "}
            {questions.length}
          </p>
          <div className="mt-4 bg-secondary-light border border-secondary rounded-lg p-4">
            <p className="text-sm text-primary-dark">
              <strong>Petunjuk:</strong> Jawab setiap pertanyaan dengan jujur
              sesuai dengan diri Anda. Tidak ada jawaban benar atau salah.
              Gunakan skala 1-5:
            </p>
            <ul className="text-sm text-primary-dark mt-2 ml-4 list-disc">
              <li>1 = Sangat Tidak Setuju</li>
              <li>2 = Tidak Setuju</li>
              <li>3 = Netral</li>
              <li>4 = Setuju</li>
              <li>5 = Sangat Setuju</li>
            </ul>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress Pengerjaan</span>
            <span>
              {answers.size} / {questions.length} terjawab
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${(answers.size / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        {currentQuestions.map((question, index) => (
          <FormatPertanyaan
            key={question.question_id}
            questionNumber={startIndex + index + 1}
            questionText={question.question_text}
            questionType="likert"
            options={LIKERT_OPTIONS}
            selectedAnswer={answers.get(question.question_id)?.toString()}
            onAnswerChange={(optionId) =>
              handleAnswerChange(question.question_id, optionId)
            }
          />
        ))}

        {/* Pagination */}
        <div className="mt-8">
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
                allQuestionsAnswered && !submitting
                  ? "bg-primary-lighter hover:bg-primary-light text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!allQuestionsAnswered || submitting}
              onClick={handleSubmit}
            >
              {submitting
                ? "Mengirim..."
                : allQuestionsAnswered
                ? `Selesai & Lihat Hasil`
                : `Jawab Semua Pertanyaan (${answers.size}/${questions.length})`}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TesPertanyaan;
