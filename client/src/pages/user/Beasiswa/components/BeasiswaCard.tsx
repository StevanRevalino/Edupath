import React from "react";
import { ExternalLink, Calendar } from "lucide-react";

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface BeasiswaCardProps {
  beasiswa: Beasiswa;
  onClick: () => void;
  formatDate: (dateString: string) => string;
}

const BeasiswaCard: React.FC<BeasiswaCardProps> = ({
  beasiswa,
  onClick,
  formatDate,
}) => {
  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={beasiswa.image_url}
          alt={beasiswa.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
          {beasiswa.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar size={16} className="mr-2" />
          <span>Diposting: {formatDate(beasiswa.created_at)}</span>
        </div>

        <a
          href={beasiswa.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-light text-white py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Lihat Detail
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
};

export default BeasiswaCard;
