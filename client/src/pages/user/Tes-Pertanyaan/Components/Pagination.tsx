import leftArrowIcon from "../../../../assets/icons/left-arrow.png";
import RightArrowIcon from "../../../../assets/icons/right-arrow.png";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Function to convert number to Roman numerals
  const toRomanNumerals = (num: number) => {
    const romanNumerals = [
      { value: 10, numeral: "X" },
      { value: 9, numeral: "IX" },
      { value: 5, numeral: "V" },
      { value: 4, numeral: "IV" },
      { value: 1, numeral: "I" },
    ];

    let result = "";
    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-7 h-7 rounded-full flex items-center justify-center font-medium transition-colors ${
            currentPage === i
              ? "bg-primary-hoverer text-white"
              : "bg-transparent text-gray-700 hover:bg-secondary-light"
          }`}
        >
          {toRomanNumerals(i)}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-50 py-6">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="w-5 h-5 flex items-center justify-center disabled:cursor-not-allowed cursor-pointer"
      >
        <img
          src={leftArrowIcon}
          alt={`Left Arrow`}
          className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />
      </button>

      {/* Page Numbers */}
      <div className="bg-secondary-light rounded-full px-5 py-2 flex items-center gap-5">
        {renderPageNumbers()}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-5 h-5 flex items-center justify-center disabled:cursor-not-allowed cursor-pointer"
      >
        <img
          src={RightArrowIcon}
          alt={`Right Arrow`}
          className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />
      </button>
    </div>
  );
}
