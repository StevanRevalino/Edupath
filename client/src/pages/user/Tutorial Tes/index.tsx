import TutorialCard from "./components/tutorial-card";
import { useNavigate } from "react-router-dom";

export default function TutorialTes() {
  const navigate = useNavigate();

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
      <div className="flex items-center justify-center min-h-screen">
        <TutorialCard onStartTest={() => navigate("/tes/pertanyaan")} />
      </div>
    </>
  );
}
