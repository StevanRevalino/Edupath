import { useState } from "react";

interface Option {
  id: string;
  text: string;
}

type QuestionType = "text" | "yesno" | "likert";

interface FormatPertanyaanProps {
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  options: Option[];
  selectedAnswer?: string;
  onAnswerChange?: (optionId: string) => void;
}

export default function FormatPertanyaan({
  questionNumber,
  questionText,
  questionType,
  options,
  selectedAnswer,
  onAnswerChange,
}: FormatPertanyaanProps) {
  const [selected, setSelected] = useState<string>(selectedAnswer || "");

  const handleOptionClick = (optionId: string) => {
    setSelected(optionId);
    onAnswerChange?.(optionId);
  };

  const renderTextOptions = () => (
    <div className="flex justify-between items-center gap-4">
      {options.map((option) => (
        <div key={option.id} className="flex flex-col items-center">
          <button
            onClick={() => handleOptionClick(option.id)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
              selected === option.id
                ? "border-[#3FBBFE] bg-[#3FBBFE]"
                : "border-gray-400 bg-transparent hover:border-[#3FBBFE]"
            }`}
          >
            {selected === option.id && (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            )}
          </button>
          <span className="text-sm text-gray-700 text-center max-w-24">
            {option.text}
          </span>
        </div>
      ))}
    </div>
  );

  const renderYesNoOptions = () => (
    <div className="flex justify-center items-center gap-100">
      {options.map((option) => (
        <div key={option.id} className="flex flex-col items-center">
          <button
            onClick={() => handleOptionClick(option.id)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
              selected === option.id
                ? "border-[#3FBBFE] bg-[#3FBBFE]"
                : "border-gray-400 bg-transparent hover:border-[#3FBBFE]"
            }`}
          >
            {selected === option.id && (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            )}
          </button>
          <span className="text-sm text-gray-700 text-center">
            {option.text}
          </span>
        </div>
      ))}
    </div>
  );

  const renderLikertOptions = () => (
    <div className="flex justify-between items-start">
      {options.map((option, index) => (
        <div
          key={option.id}
          className="flex flex-col items-center min-h-[60px]"
        >
          <button
            onClick={() => handleOptionClick(option.id)}
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-colors ${
              selected === option.id
                ? "border-[#3FBBFE] bg-[#3FBBFE]"
                : "border-gray-400 bg-transparent hover:border-[#3FBBFE]"
            }`}
          >
            {selected === option.id && (
              <div className="w-3 h-3 rounded-full bg-white"></div>
            )}
          </button>
          {/* Only show text for first and last option */}
          <div className="min-h-[32px] flex items-start justify-center">
            {(index === 0 || index === options.length - 1) && (
              <span className="text-sm text-gray-700 text-center max-w-30">
                {option.text}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderOptions = () => {
    switch (questionType) {
      case "text":
        return renderTextOptions();
      case "yesno":
        return renderYesNoOptions();
      case "likert":
        return renderLikertOptions();
      default:
        return renderTextOptions();
    }
  };

  return (
    <div className=" p-5 mb-5›">
      {/* Question */}
      <div className="mb-6">
        <p className="text-gray-800 text-base leading-relaxed">
          {questionNumber}. {questionText}
        </p>
      </div>

      {/* Options */}
      {renderOptions()}
    </div>
  );
}
