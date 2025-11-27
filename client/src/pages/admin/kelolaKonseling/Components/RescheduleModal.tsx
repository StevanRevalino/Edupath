import type { FC } from "react";
import { useState, useEffect } from "react";
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
import { CalendarIcon, Clock, X, Minus } from "lucide-react";
import { consultationHandler } from "../../../../handler/consultationHandler";

interface Consultation {
  consultation_id: string;
  murid_id: string;
  topic: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  consultation_date: string;
  consultation_time: string;
  notes?: string;
  admin_notes?: string;
  description?: string;
  created_at: string;
  is_active: boolean;
  murid: {
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
}

interface RescheduleModalProps {
  isOpen: boolean;
  consultation: Consultation | null;
  onClose: () => void;
  onSubmit: (data: {
    date: Date;
    time: string;
    endTime: string;
    reason: string;
  }) => void;
  timeSlots: string[];
}

const RescheduleModal: FC<RescheduleModalProps> = ({
  isOpen,
  consultation,
  onClose,
  onSubmit,
  timeSlots,
}) => {
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    new Date()
  );
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>("");
  const [rescheduleReason, setRescheduleReason] = useState<string>("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Fetch booked slots for selected date
  const fetchBookedSlots = async (date: Date) => {
    try {
      const response = await consultationHandler.getBookedSlotsForDate(date);
      // Extract startTime from booked slots
      const slots = response.data?.map((slot) => slot.startTime) || [];
      setBookedSlots(slots);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // Update booked slots when reschedule date changes
  useEffect(() => {
    if (rescheduleDate && isOpen) {
      fetchBookedSlots(rescheduleDate);
    }
  }, [rescheduleDate, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRescheduleDate(new Date());
      setRescheduleTime("");
      setRescheduleEndTime("");
      setRescheduleReason("");
    }
  }, [isOpen]);

  // Helper function to check if a time slot is disabled
  const isTimeSlotDisabled = (timeSlot: string): boolean => {
    if (!rescheduleDate) return false;

    // Check if slot is already booked
    if (bookedSlots.includes(timeSlot)) {
      return true;
    }

    // Check if slot is in the past (for today only)
    const today = new Date();
    const isToday = rescheduleDate.toDateString() === today.toDateString();

    if (!isToday) return false;

    const [hours, minutes] = timeSlot.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime <= today;
  };

  const handleSubmit = () => {
    if (!rescheduleDate || !rescheduleTime || !rescheduleReason.trim()) {
      return;
    }

    onSubmit({
      date: rescheduleDate,
      time: rescheduleTime,
      endTime: rescheduleEndTime,
      reason: rescheduleReason,
    });
  };

  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reschedule Konseling
          </h2>
          <p className="text-sm text-gray-600">
            Ubah jadwal konseling dengan{" "}
            <span className="font-semibold">
              {consultation.murid.firstname} {consultation.murid.lastname}
            </span>
          </p>
          <div className="h-1 w-20 bg-yellow-500 rounded-full mt-2"></div>
        </div>

        {/* Modal Content */}
        <div className="space-y-6">
          {/* Current Schedule Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Jadwal Saat Ini
            </div>
            <div className="text-base text-gray-900">
              {new Date(consultation.consultation_date).toLocaleDateString(
                "id-ID",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}{" "}
              pukul{" "}
              {new Date(consultation.consultation_date).toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </div>
          </div>

          {/* New Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Tanggal Baru <span className="text-red-500">*</span>
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
              Pilih Waktu Baru <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {/* Start Time */}
              <div className="flex-1">
                <Popover open={timeOpen} onOpenChange={setTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !rescheduleTime && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {rescheduleTime || "Pilih waktu"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="grid grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const disabled = isTimeSlotDisabled(slot);
                        return (
                          <Button
                            key={slot}
                            variant={
                              rescheduleTime === slot ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              if (!disabled) {
                                setRescheduleTime(slot);
                                // Auto-set end time to 1 hour later
                                const [hours, minutes] = slot
                                  .split(":")
                                  .map(Number);
                                const endHour = hours + 1;
                                const endTime = `${endHour
                                  .toString()
                                  .padStart(2, "0")}:${minutes
                                  .toString()
                                  .padStart(2, "0")}`;
                                setRescheduleEndTime(endTime);
                                setTimeOpen(false);
                              }
                            }}
                            disabled={disabled}
                            className="h-10"
                          >
                            {slot}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Minus className="text-gray-400" />
              {/* End Time - Auto calculated (1 hour after start) */}
              <div className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11",
                    !rescheduleEndTime && "text-muted-foreground"
                  )}
                  disabled
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {rescheduleEndTime || "waktu selesai"}
                </Button>
              </div>
            </div>
            {rescheduleTime && bookedSlots.includes(rescheduleTime) && (
              <p className="text-xs text-yellow-600 mt-1">
                ⚠️ Slot ini sudah dibooking oleh konseling lain
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alasan Reschedule <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rescheduleReason}
              onChange={(e) => setRescheduleReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              rows={4}
              placeholder="Masukkan alasan mengapa jadwal perlu diubah..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              !rescheduleDate || !rescheduleTime || !rescheduleReason.trim()
            }
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
