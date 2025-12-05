import { useState } from "react";
import TutorialIcon1 from "../../../../assets/tutorial-icon-1.png";
import TutorialIcon2 from "../../../../assets/tutorial-icon-2.png";
import TutorialIcon3 from "../../../../assets/tutorial-icon-3.png";

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
  buttonText?: string;
}

interface TutorialCardProps {
  onStartTest?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    icon: TutorialIcon1,
    title: "Kenali Dirimu Lebih Dalam",
    description:
      "Tes ini dirancang untuk membantumu memahami minat dan bakat pribadimu. Hasilnya akan membantumu menentukan jurusan atau jalur karier yang sesuai.",
  },
  {
    icon: TutorialIcon3,
    title: "Luangkan Waktu Sebentar",
    description:
      "Tes ini memerlukan waktu hanya beberapa menit. Pastikan kamu berada di tempat yang tenang dan tidak terganggu saat mengerjakan.",
  },
  {
    icon: TutorialIcon2,
    title: "Tidak Ada Jawaban Benar atau Salah",
    description:
      "Pilih jawaban yang paling menggambarkan dirimu apa adanya, bukan yang menurutmu paling benar. Jawaban jujur = hasil lebih akurat!",
    buttonText: "Mulai tes",
  },
];

export default function TutorialCard({ onStartTest }: TutorialCardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const currentTutorial = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onStartTest?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent button click from triggering card click
    if ((e.target as HTMLElement).tagName === "BUTTON") {
      return;
    }
    handleNext();
  };

  return (
    <div
      className="bg-secondary-light rounded-3xl p-8 w-[500px] h-[550px] text-center relative overflow-hidden z-0 cursor-pointer transition-transform hover:scale-105"
      onClick={handleCardClick}
    >
      {/* Content */}
      <div className="relative z-10 mb-6 flex justify-center">
        <img
          src={currentTutorial.icon}
          alt={`Tutorial step ${currentStep + 1}`}
          className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4 relative z-10 transition-opacity duration-300">
        {currentTutorial.title}
      </h2>

      <p className="text-gray-600 text-sm leading-relaxed mb-8 relative z-10 transition-opacity duration-300">
        {currentTutorial.description}
      </p>

      {isLastStep && (
        <button
          onClick={handleNext}
          className="bg-primary-lighter hover:bg-primary-light text-white font-medium py-3 px-8 rounded-full transition-colors relative z-10"
        >
          {currentTutorial.buttonText}
        </button>
      )}

      {/* Step indicator dots */}
      {!isLastStep && (
        <p className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-gray-500 text-sm hover:text-gray-700 transition-colors z-10">
          Klik untuk lanjut
        </p>
      )}

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2 z-10">
        {tutorialSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentStep
                ? "bg-gray-600"
                : index < currentStep
                ? "bg-gray-400"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
