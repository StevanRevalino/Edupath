import { useState } from "react";
import { X, Video, Calendar, Clock, FileText } from "lucide-react";

interface ZoomRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  consultationId: string;
  onSubmit: (data: ZoomRequestData) => Promise<void>;
}

export interface ZoomRequestData {
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  description: string;
}

const ZoomRequestModal = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  onSubmit,
}: ZoomRequestModalProps) => {
  const [formData, setFormData] = useState<ZoomRequestData>({
    topic: "Konseling Akademik",
    scheduledDate: "",
    scheduledTime: "",
    duration: 30,
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        topic: "Konseling Akademik",
        scheduledDate: "",
        scheduledTime: "",
        duration: 30,
        description: "",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting zoom request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Video className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Buat Zoom Meeting
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Student Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              Meeting akan dikirim ke:
            </p>
            <p className="font-semibold text-gray-800 text-lg">{studentName}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {studentId}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topic */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="mr-2 text-gray-500" />
                Topik Meeting
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Konseling Karir & Jurusan"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="mr-2 text-gray-500" />
                  Tanggal
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="mr-2 text-gray-500" />
                  Waktu
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="mr-2 text-gray-500" />
                Durasi Meeting
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value={15}>15 menit</option>
                <option value={30}>30 menit</option>
                <option value={45}>45 menit</option>
                <option value={60}>1 jam</option>
                <option value={90}>1.5 jam</option>
                <option value={120}>2 jam</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="mr-2 text-gray-500" />
                Deskripsi / Agenda
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={4}
                placeholder="Jelaskan tujuan meeting dan hal yang akan dibahas..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>ℹ️ Catatan:</strong> Link Zoom meeting akan dikirim ke
                siswa melalui notifikasi dan chat setelah meeting dibuat.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Membuat...</span>
                  </>
                ) : (
                  <>
                    <Video size={20} />
                    <span>Buat Meeting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ZoomRequestModal;
