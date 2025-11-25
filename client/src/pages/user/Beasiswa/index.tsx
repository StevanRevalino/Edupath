import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { beasiswaService } from "../../../services/beasiswaService";

import HeroSection from "../../../components/HeroSection";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EmptyState from "../../../components/EmptyState";
import ImageZoomModal from "../../../components/ImageZoomModal";
import BeasiswaCard from "./components/BeasiswaCard";
import BeasiswaDetailModal from "./components/BeasiswaDetailModal";

import HeroSectionBG from "../../../assets/hero-section.png";
import BeasiswaIcon from "../../../assets/icons/conseling-icon.png";

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

const Beasiswa = () => {
  const [beasiswaList, setBeasiswaList] = useState<Beasiswa[]>([]);
  const [filteredList, setFilteredList] = useState<Beasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBeasiswa, setSelectedBeasiswa] = useState<Beasiswa | null>(
    null
  );
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Fetch beasiswa data
  useEffect(() => {
    fetchBeasiswa();
  }, []);

  // Filter beasiswa based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredList(beasiswaList);
    } else {
      const filtered = beasiswaList.filter((beasiswa) =>
        beasiswa.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchTerm, beasiswaList]);

  const fetchBeasiswa = async () => {
    try {
      setLoading(true);
      const response = await beasiswaService.getAllBeasiswa();
      setBeasiswaList(response.data);
      setFilteredList(response.data);
    } catch (error) {
      console.error("Error fetching beasiswa:", error);
      toast.error("Gagal mengambil data beasiswa");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Reset zoom state when modal closes
  const handleCloseModal = () => {
    setSelectedBeasiswa(null);
    setIsImageZoomed(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Hero Section */}
      <HeroSection
        backgroundImage={HeroSectionBG}
        title="Info Beasiswa"
        description={
          <>
            Temukan berbagai informasi beasiswa dari <br />
            universitas dan institusi pendidikan
          </>
        }
        icon={BeasiswaIcon}
      >
        {/* Search Bar */}
        <div className="mt-5 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari beasiswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg text-sm"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            ) : (
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            )}
          </div>
        </div>
      </HeroSection>

      {/* Beasiswa List Section */}
      <section className="min-h-screen bg-gray-100 pt-8 sm:pt-80 lg:pt-[520px] relative px-5 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-2 md:mb-6">
              Daftar Beasiswa Tersedia
            </h2>
            {searchTerm && (
              <p className="text-gray-600">
                Ditemukan {filteredList.length} beasiswa
              </p>
            )}
          </div>

          {loading ? (
            <LoadingSpinner size="lg" message="Memuat data beasiswa..." />
          ) : filteredList.length === 0 ? (
            <EmptyState
              icon={<Search size={64} className="mx-auto" />}
              title={
                searchTerm
                  ? "Beasiswa tidak ditemukan"
                  : "Belum ada info beasiswa"
              }
              description={
                searchTerm
                  ? "Coba gunakan kata kunci lain"
                  : "Guru BK belum menambahkan info beasiswa"
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredList.map((beasiswa) => (
                <BeasiswaCard
                  key={beasiswa.beasiswa_id}
                  beasiswa={beasiswa}
                  onClick={() => setSelectedBeasiswa(beasiswa)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Modal Detail */}
      <BeasiswaDetailModal
        beasiswa={selectedBeasiswa}
        isOpen={!!selectedBeasiswa}
        onClose={handleCloseModal}
        onImageZoom={() => setIsImageZoomed(true)}
        formatDate={formatDate}
      />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        imageUrl={selectedBeasiswa?.image_url || ""}
        imageAlt={selectedBeasiswa?.title || ""}
        isOpen={isImageZoomed}
        onClose={() => setIsImageZoomed(false)}
        title={selectedBeasiswa?.title}
      />
    </div>
  );
};

export default Beasiswa;
