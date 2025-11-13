import { useState } from "react";
import { X, Video, FileText } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";

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
    description: "",
  });
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    undefined
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
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
        description: "",
      });
      setRescheduleDate(undefined);
      onClose();
    } catch (error) {
      console.error("Error submitting zoom request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-secondary-light p-2 rounded-lg">
              <Video className="text-primary" size={24} />
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
          <div className="bg-secondary-light border border-secondary rounded-lg p-4 mb-6">
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Tanggal <span className="text-red-500">*</span>
              </label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? (
                      format(rescheduleDate, "PPP", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={(date) => {
                      setRescheduleDate(date);
                      if (date) {
                        setFormData({
                          ...formData,
                          scheduledDate: format(date, "yyyy-MM-dd"),
                        });
                      }
                      setDateOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pilih Waktu <span className="text-red-500">*</span>
              </label>
              <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !formData.scheduledTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.scheduledTime ? (
                      formData.scheduledTime
                    ) : (
                      <span>Pilih waktu</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-2" align="start">
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                    {Array.from({ length: 10 }, (_, i) => {
                      const hour = 8 + i;
                      return [
                        `${hour.toString().padStart(2, "0")}:00`,
                        `${hour.toString().padStart(2, "0")}:30`,
                      ];
                    })
                      .flat()
                      .filter((_, i, arr) => i < arr.length - 1)
                      .map((timeSlot) => (
                        <Button
                          key={timeSlot}
                          variant={
                            formData.scheduledTime === timeSlot
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              scheduledTime: timeSlot,
                            });
                            setTimeOpen(false);
                          }}
                          className="h-9"
                        >
                          {timeSlot}
                        </Button>
                      ))}
                  </div>
                </PopoverContent>
              </Popover>
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
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
