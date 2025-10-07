import React from "react";
import { X } from "lucide-react";

interface ImageZoomModalProps {
  imageUrl: string;
  imageAlt: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  imageUrl,
  imageAlt,
  isOpen,
  onClose,
  title,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4 ${className}`}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
      >
        <X size={32} />
      </button>

      {/* Zoomed Image */}
      <div
        className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Image Title */}
      {title && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full max-w-2xl text-center">
          <p className="text-sm md:text-base font-semibold truncate">{title}</p>
        </div>
      )}
    </div>
  );
};

export default ImageZoomModal;
