import React from "react";
import { X, Calendar, ExternalLink, ZoomIn } from "lucide-react";

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface BeasiswaDetailModalProps {
  beasiswa: Beasiswa | null;
  isOpen: boolean;
  onClose: () => void;
  onImageZoom: () => void;
  formatDate: (dateString: string) => string;
}

const BeasiswaDetailModal: React.FC<BeasiswaDetailModalProps> = ({
  beasiswa,
  isOpen,
  onClose,
  onImageZoom,
  formatDate,
}) => {
  if (!isOpen || !beasiswa) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Detail Beasiswa</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Image */}
          <div className="mb-6 rounded-xl overflow-hidden relative group">
            <img
              src={beasiswa.image_url}
              alt={beasiswa.title}
              className="w-full max-h-96 object-contain bg-gray-100 cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={onImageZoom}
            />
            <div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center cursor-pointer"
              onClick={onImageZoom}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                <ZoomIn size={32} className="text-gray-700" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {beasiswa.title}
          </h3>

          {/* Date Info */}
          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="text-sm">
                Diposting: {formatDate(beasiswa.created_at)}
              </span>
            </div>
            {beasiswa.updated_at !== beasiswa.created_at && (
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="text-sm">
                  Diperbarui: {formatDate(beasiswa.updated_at)}
                </span>
              </div>
            )}
          </div>

          {/* Link Button */}
          <a
            href={beasiswa.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Kunjungi Halaman Beasiswa
            <ExternalLink size={20} />
          </a>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-gray-700">
              <strong>Catatan:</strong> Klik tombol di atas untuk mengakses
              informasi lengkap tentang beasiswa ini di website atau media
              sosial resmi penyedia beasiswa. Klik gambar untuk memperbesar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeasiswaDetailModal;
