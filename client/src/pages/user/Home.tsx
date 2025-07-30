import { ChevronRight } from "lucide-react";
import React, { useState } from "react";

const Home = () => {
  const infoItems = [
    { label: "Tentang kami" },
    { label: "Apa itu tes minat & bakat?" },
    { label: "Telusuri jurusan" },
    { label: "Hubungi kami" },
    { label: "Rekomendasi Universitas" },
    { label: "Info beasiswa" },
  ];
  const historyTags = [
    "Akuntansi",
    "Mikrobiologi",
    "Teknik Sipil",
    "Aktuaria",
    "Manajemen",
    "Food Tech",
    "Akuntansi",
    "Mikrobiologi",
    "Teknik Sipil",
    "Aktuaria",
    "Manajemen",
    "Food Tech",
    "Akuntansi",
    "Mikrobiologi",
    "Teknik Sipil",
    "Aktuaria",
    "Manajemen",
    "Food Tech",
  ];
  const testHistories = [
    { date: "tgl bln thn", major: "Nama Jurusan", score: "xxxxxx" },
    { date: "tgl bln thn", major: "Nama Jurusan", score: "xxxxxx" },
    { date: "tgl bln thn", major: "Nama Jurusan", score: "xxxxxx" },
    { date: "tgl bln thn", major: "Nama Jurusan", score: "xxxxxx" },
    { date: "tgl bln thn", major: "Nama Jurusan", score: "xxxxxx" },
  ];
  const colorMap: Record<string, string> = {
    Akuntansi: "bg-[#3C3782]",
    Mikrobiologi: "bg-[#B31507]",
    "Teknik Sipil": "bg-[#B7D200]",
    Aktuaria: "bg-[#00B7F3]",
    Manajemen: "bg-[#FF00E5]",
    "Food Tech": "bg-[#F0544F]",
    // Tambahkan warna untuk jurusan lain jika ada
  };

  const [showAll, setShowAll] = useState(false);
  const displayedTags = showAll ? historyTags : historyTags.slice(0, 5);
  const hasMore = historyTags.length > 5 && !showAll;

  return (
    <div className=" px-24 ">
      <div className="flex flex-col items-start px-20 pt-10">
        <h1 className="text-5xl font-bold">Hello, Name!</h1>
        <div className="flex justify-between w-full items-center">
          <div className="flex flex-col items-center">
            <div className="relative flex items-center py-6">
              <div className=" absolute left-0 w-36 h-36 rounded-full bg-white border-3 border-[#003B73]" />
              <div className="flex items-center border-3 border-[#003B73] rounded-full pl-32 pr-8 py-6 min-w-[380px]">
                <div className="ml-4 flex flex-col  items-center">
                  <div className="text-3xl font-bold">Nama Lengkap</div>
                  <div className="text-xl font-semibold  text-gray-700">
                    Kelas XX
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start w-full ml-8">
              <button className="bg-[#003B73] text-white px-6 py-3 rounded-md text-sm">
                Ubah profil
              </button>
            </div>
          </div>
          <div className="mb-5">
            <div className="bg-[#e6f3ff] border-3 border-[#003B73] rounded-tl-[50px] rounded-br-[50px] pl-4 pr-3 pt-4 pb-3">
              <div className="relative mb-3">
                <div className="absolute -top-9 left-10 bg-white px-8 py-0.5 border-3 border-[#003B73] rounded-4xl text-md font-bold">
                  Info
                </div>
              </div>
              <div className="flex flex-row gap-4 items-start">
                {infoItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center text-[13px] font-bold w-[110px] mt-1"
                  >
                    <div className="w-24 h-20 bg-white rounded-3xl border-1 border-[#003B73] mb-1 items-start" />
                    {item.label}
                  </div>
                ))}
                <div className="flex justify-center items-center h-full mt-7 font-bold">
                  <ChevronRight className="text-[#003B73] font-bold w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*analytic*/}
      <div className="mt-16 w-full border-3 border-red-700 rounded-br-[60px] rounded-tl-[60px] bg-[#FFEEEE] px-10 py-6 relative">
        <div className="absolute -top-6 left-10 bg-white border-3 border-red-700 rounded-4xl px-4 py-1 font-bold text-md">
          Analytics
        </div>

        {/* ===== Content ===== */}
        <div className="grid grid-cols-[1fr_3fr] gap-x-6 gap-y-2 mt-2">
          {/* 1.1 Total Tes */}
          <div className="row-span-1">
            <div className="text-3xl font-bold mb-2">
              Total tes diselesaikan
            </div>
            <div className="flex gap-4">
              <div>
                <div className="text-[#780000] text-6xl font-bold">10</div>
                <div className="text-xl font-bold ml-3">Tes</div>
              </div>
              <div className="text-base">
                Kamu telah mengerjakan <br />
                tes minat bakat sebanyak <br />
                <strong>10 kali!</strong>
              </div>
            </div>
          </div>

          {/* 1.2 Riwayat Penjurusan + Rekomendasi */}
          <div className="row-span-1">
            <div>
              <div className="text-lg font-bold mb-3">Riwayat Penjurusan</div>
              <div className="flex flex-wrap justify-start gap-3">
                {displayedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`text-white text-sm px-3 py-1 rounded-full font-semibold ${
                      colorMap[tag] || "bg-[#888]"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {hasMore && (
                  <>
                    <span className="text-white text-sm px-3 py-1 rounded-full font-semibold bg-gray-500">
                      ...
                    </span>
                    <button
                      onClick={() => setShowAll(true)}
                      className="text-white text-sm px-3 py-1 rounded-full font-semibold bg-gray-500 cursor-pointer"
                    >
                      Lihat lainnya...
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="text-end mt-4">
              <div className="text-2xl font-bold">
                (85%) Jurusan paling cocok
              </div>
              <div className="text-green-700 text-4xl font-bold">
                Computer Science
              </div>
              <div className="text-sm mt-1">
                Rekomendasi tertinggimu saat ini!
              </div>
            </div>
          </div>

          {/* 2.1 Tes Terakhir */}
          <div className="row-span-1">
            <div className="text-2xl font-bold mb-2">Tes terakhir</div>
            <div className="flex gap-4">
              <div>
                <div className="text-[#180085] text-6xl font-bold">10</div>
                <div className="text-xl font-bold ml-3">Tes</div>
              </div>
              <div className="text-base">
                Terakhir kali kamu mengerjakan <br />
                tes minat bakat adalah pada: <br />
                <strong>tgl/bln/thn.</strong>
              </div>
            </div>
          </div>

          {/* 2.2 Riwayat Tes */}
          <div className="row-span-1">
            <div className="text-2xl font-bold mb-3">Riwayat Tes</div>
            <div className="flex flex-row gap-4 flex-wrap">
              {testHistories.map((test, idx) => (
                <div
                  key={idx}
                  className="bg-[#f9f9f9] rounded-lg shadow border border-gray-300 w-fit p-3"
                >
                  <div className="text-sm font-bold">{test.date}</div>
                  <div className="text-sm">
                    Hasil penjurusan: <br />
                    <span className="font-bold">{test.major}</span>
                  </div>
                  <div className="text-sm font-bold">
                    Skor akhir: {test.score}
                  </div>
                  <div className="text-xs underline mt-1 cursor-pointer">
                    Lihat rincian &gt;&gt;
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
