import React from "react";
import { useNavigate } from "react-router-dom";
import TestCompleted from "../../../assets/tes-completed.png";

export default function TesCompleted() {
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

      <div className="flex flex-col items-center justify-center min-h-screen px-6 -mt-25">
        <div className="flex flex-col items-center text-center">
          <img src={TestCompleted} alt="Test Completed" className="w-75 h-80" />

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tes selesai!
          </h1>

          <p className="text-gray-600 max-w-sm leading-relaxed mb-8">
            Selamat! Anda telah menyelesaikan tes minat & bakat. Mohon tunggu
            sebentar, kami sedang kalkulasi hasil tes Anda...
          </p>

          {/* Animated Loading Dots */}
          <div className="flex space-x-2 mt-5">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
            <div
              className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
