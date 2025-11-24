import { X, Upload } from "lucide-react";
import { type BeasiswaFormData } from "../../../../schema/BeasiswaSchema";

interface Beasiswa {
  beasiswa_id: string;
  title: string;
  image_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

interface BeasiswaFormModalProps {
  isOpen: boolean;
  selectedBeasiswa: Beasiswa | null;
  formData: BeasiswaFormData;
  imagePreview: string;
  isUploading: boolean;
  errors: Partial<Record<keyof BeasiswaFormData, string>>;
  onClose: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (field: keyof BeasiswaFormData, value: string) => void;
  onSubmit: () => void;
}

const BeasiswaFormModal = ({
  isOpen,
  selectedBeasiswa,
  formData,
  imagePreview,
  isUploading,
  errors,
  onClose,
  onImageChange,
  onInputChange,
  onSubmit,
}: BeasiswaFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {selectedBeasiswa ? "Edit Beasiswa" : "Tambah Beasiswa"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Judul Beasiswa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => onInputChange("title", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Contoh: Beasiswa LPDP 2025"
                disabled={isUploading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Website/Media Sosial{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => onInputChange("link", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.link ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="https://..."
                disabled={isUploading}
              />
              {errors.link && (
                <p className="text-red-500 text-sm mt-1">{errors.link}</p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poster/Gambar <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 ${
                  errors.image_url ? "border-red-500" : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded"
                      />
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        Klik untuk mengubah gambar
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload
                        size={48}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-gray-600">Klik untuk upload gambar</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Max 5MB (PNG, JPG, JPEG)
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {errors.image_url && (
                <p className="text-red-500 text-sm mt-1">{errors.image_url}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                Batal
              </button>
              <button
                onClick={onSubmit}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isUploading}
              >
                {isUploading
                  ? "Mengupload..."
                  : selectedBeasiswa
                  ? "Update"
                  : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeasiswaFormModal;
