/**
 * RIASEC Info Component
 * Displays information about Holland's RIASEC theory and the hexagon model
 */

import React from "react";

const RiasecInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        Apa itu Tes Minat & Bakat Karier?
      </h2>

      <div className="space-y-6 text-gray-700">
        <p className="text-lg leading-relaxed text-center max-w-3xl mx-auto">
          Tes ini menggunakan{" "}
          <span className="font-bold text-primary">Model RIASEC Holland</span>{" "}
          untuk mengidentifikasi 6 tipe kepribadian kariermu dan memberikan
          rekomendasi program studi yang sesuai.
        </p>

        {/* 6 Tipe RIASEC */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔷 6 Tipe Kepribadian RIASEC
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Realistic */}
            <div className="bg-secondary-light border-2 border-secondary rounded-lg p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-primary-dark text-lg">
                    Realistic
                  </h4>
                  <p className="text-primary text-sm">Realistis</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                People with <strong>Mechanical and athletic abilities</strong>.
                Enjoy working outdoors with tools and objects; prefer dealing
                with things rather than people.
              </p>
            </div>

            {/* Investigative */}
            <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  I
                </div>
                <div>
                  <h4 className="font-bold text-purple-900 text-lg">
                    Investigative
                  </h4>
                  <p className="text-purple-700 text-sm">Investigatif</p>
                </div>
              </div>
              <p className="text-purple-900 text-sm leading-relaxed">
                People with <strong>Math and Science abilities</strong>; like
                working to solve complex problems; prefer dealing with ideas
                rather than people or things.
              </p>
            </div>

            {/* Artistic */}
            <div className="bg-pink-50 border-2 border-pink-500 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-pink-900 text-lg">Artistic</h4>
                  <p className="text-pink-700 text-sm">Artistik</p>
                </div>
              </div>
              <p className="text-pink-900 text-sm leading-relaxed">
                People with <strong>artistic ability and imagination</strong>;
                enjoy creating original work; prefer dealing with ideas rather
                than things.
              </p>
            </div>

            {/* Social */}
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-green-900 text-lg">Social</h4>
                  <p className="text-green-700 text-sm">Sosial</p>
                </div>
              </div>
              <p className="text-green-900 text-sm leading-relaxed">
                People with <strong>social skills</strong>; interest in social
                relationships and helping others solve problems; prefers to deal
                with people rather than things.
              </p>
            </div>

            {/* Enterprising */}
            <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  E
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-lg">
                    Enterprising
                  </h4>
                  <p className="text-orange-700 text-sm">Kewirausahaan</p>
                </div>
              </div>
              <p className="text-orange-900 text-sm leading-relaxed">
                People with <strong>leadership and speaking abilities</strong>;
                like to be influential; prefer dealing with people rather than
                things.
              </p>
            </div>

            {/* Conventional */}
            <div className="bg-gray-50 border-2 border-gray-500 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                  C
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Conventional
                  </h4>
                  <p className="text-gray-700 text-sm">Konvensional</p>
                </div>
              </div>
              <p className="text-gray-900 text-sm leading-relaxed">
                People with <strong>clerical and math ability</strong>; prefer
                working indoors and organizing things; prefer to deal with words
                and numbers rather than people or ideas.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 Cara Kerja Tes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">
                60 Pertanyaan
              </div>
              <p className="text-gray-700">
                Jawab pertanyaan sesuai minat dan preferensimu dengan skala 1-5.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                Kode 3 Huruf
              </div>
              <p className="text-gray-700">
                Hasil berupa kode seperti "RIA" yang menunjukkan tipe dominanmu.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                Analisis Kepribadian
              </div>
              <p className="text-gray-700">
                Ketahui kekuatan, minat, dan gaya kerjamu yang unik.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                Rekomendasi Jurusan
              </div>
              <p className="text-gray-700">
                Dapatkan 20+ program studi yang cocok untukmu.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center">
          <h3 className="text-xl font-bold mb-3">🎯 Kenapa Tes Ini Penting?</h3>
          <p className="text-lg">
            Memilih jurusan yang sesuai dengan kepribadian meningkatkan peluang
            sukses dan kepuasanmu di masa depan!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiasecInfo;
