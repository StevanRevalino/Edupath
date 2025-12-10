import React, { useState, useEffect } from "react";
import { X, Clock, CalendarIcon, Minus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import clockLogo from "../../../../assets/icons/clock-icon.png";
import axios from "axios";
import TokenManager from "../../../../utils/tokenManager";
import toast from "react-hot-toast";
import {
  konselingSchema,
  type KonselingFormData,
} from "../../../../schema/KonselingSchema";

const API_URL = import.meta.env.VITE_API_URL;

interface Admin {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

// Generate time slots (8:00 - 17:00, since consultation is 1 hour, last slot is 17:00)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

interface ModalJadwalkanKonselingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalJadwalkanKonseling: React.FC<ModalJadwalkanKonselingProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>("");
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<string>("");
  const [dateOpen, setDateOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Set<string>>(
    new Set()
  );
  const [formData, setFormData] = useState({
    message: "",
    expertName: "",
    description: "",
  });

  // Helper function to check if a time slot is disabled
  const isTimeSlotDisabled = (
    timeSlot: string,
    selectedDate?: Date
  ): boolean => {
    if (!selectedDate) return false;

    // Check if slot is already booked
    if (bookedSlots.includes(timeSlot)) {
      return true;
    }

    // Check if slot is in the past (for today only)
    // Use Indonesia timezone (WIB - UTC+7) for consistency with validation
    const now = new Date();
    const indonesiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );

    const isToday =
      selectedDate.toDateString() === indonesiaTime.toDateString();

    if (!isToday) return false;

    const [hours, minutes] = timeSlot.split(":").map(Number);
    const slotTime = new Date(indonesiaTime);
    slotTime.setHours(hours, minutes, 0, 0);

    // Add 5 minute buffer - slot must be at least 5 minutes from now
    const fiveMinutesFromNow = new Date(
      indonesiaTime.getTime() + 5 * 60 * 1000
    );

    return slotTime < fiveMinutesFromNow;
  };

  // Helper function to get all time slots (don't filter, just return all)
  const getAvailableTimeSlots = (): string[] => {
    // Return ALL slots - disabled status will be handled by isTimeSlotDisabled
    return timeSlots;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch admins when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
      // Fetch booked slots for initial date and selected admin
      if (selectedDate && formData.expertName) {
        fetchBookedSlots(selectedDate, formData.expertName);
      }
    }
  }, [isOpen]);

  // Fetch booked slots when date or admin changes
  useEffect(() => {
    if (selectedDate && isOpen && formData.expertName) {
      fetchBookedSlots(selectedDate, formData.expertName);
    }
  }, [selectedDate, formData.expertName, isOpen]);

  const fetchAdmins = async () => {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(`${API_URL}/api/users/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.data) {
        setAdmins(response.data.data);

        // Set default expert to first admin if available
        if (response.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            expertName: response.data.data[0].user_id,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchBookedSlots = async (date: Date, adminId: string) => {
    try {
      // Format date as YYYY-MM-DD in LOCAL timezone (not UTC)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const token = TokenManager.getToken();
      let url = `${API_URL}/api/consultations/booked-slots?date=${dateStr}`;
      if (adminId) {
        url += `&adminId=${adminId}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        // Extract ALL time slots that are occupied (start time and slots within the period, but NOT including end time)
        const bookedTimes: string[] = [];

        response.data.forEach((slot: any) => {
          const startTime = slot.startTime; // e.g., "08:00"
          const endTime = slot.endTime; // e.g., "09:00"

          // Parse start and end times
          const [startHour, startMin] = startTime.split(":").map(Number);
          const [endHour, endMin] = endTime.split(":").map(Number);

          // Add all 30-minute slots from start up to (but NOT including) end
          let currentHour = startHour;
          let currentMin = startMin;

          while (
            currentHour < endHour ||
            (currentHour === endHour && currentMin < endMin)
          ) {
            const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
              currentMin
            ).padStart(2, "0")}`;
            bookedTimes.push(timeStr);

            // Move to next 30-minute slot
            currentMin += 30;
            if (currentMin >= 60) {
              currentHour++;
              currentMin = 0;
            }
          }
        });

        setBookedSlots(bookedTimes);

        // Check if this date is fully booked for this admin
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        let availableSlotCount = timeSlots.length;

        if (isToday) {
          // For today, count only future slots
          availableSlotCount = timeSlots.filter((slot) => {
            const [hours, minutes] = slot.split(":").map(Number);
            const slotTime = new Date(today);
            slotTime.setHours(hours, minutes, 0, 0);
            return slotTime > today;
          }).length;
        }

        // Update fully booked dates set
        if (
          bookedTimes.length >= availableSlotCount &&
          availableSlotCount > 0
        ) {
          setFullyBookedDates((prev) => new Set(prev).add(dateStr));
        } else {
          setFullyBookedDates((prev) => {
            const newSet = new Set(prev);
            newSet.delete(dateStr);
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]); // Reset on error
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setErrors({}); // Clear previous errors

      // Prepare data for validation
      const validationData: KonselingFormData = {
        selectedDate: selectedDate || new Date(),
        selectedTimeStart,
        selectedTimeEnd,
        message: formData.message,
        description: formData.description,
        expertName: formData.expertName,
      };

      // Validate using Yup schema
      await konselingSchema.validate(validationData, { abortEarly: false });

      // Combine date and time for consultation_date
      // Parse date and time as Indonesia timezone (WIB = UTC+7)
      const year = selectedDate!.getFullYear();
      const month = String(selectedDate!.getMonth() + 1).padStart(2, "0");
      const date = String(selectedDate!.getDate()).padStart(2, "0");

      // Create ISO string in Indonesia timezone format
      // Backend expects: "YYYY-MM-DDTHH:mm:ss+07:00" (WIB timezone)
      const consultationDateStr = `${year}-${month}-${date}T${selectedTimeStart}:00+07:00`;

      // Get user ID from token
      const userData = TokenManager.getUserData();

      if (!userData.userId) {
        toast.error("User not authenticated");
        return;
      }

      const consultationData = {
        murid_id: userData.userId,
        admin_id: formData.expertName,
        topic: formData.message,
        consultation_date: consultationDateStr,
        description: formData.description,
      };

      const token = TokenManager.getToken();
      const response = await axios.post(
        `${API_URL}/api/consultations`,
        consultationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Konsultasi berhasil dijadwalkan!");
        // Reset form
        setSelectedDate(new Date());
        setSelectedTimeStart("");
        setSelectedTimeEnd("");
        setFormData({
          message: "",
          expertName: admins.length > 0 ? admins[0].user_id : "",
          description: "",
        });
        setErrors({});
        onSuccess(); // Call parent callback to refresh data
        onClose(); // Close modal
      } else {
        toast.error(response.data.message || "Gagal menjadwalkan konsultasi");
      }
    } catch (error: any) {
      console.error("Error creating consultation:", error);

      // Handle Yup validation errors
      if (error.name === "ValidationError") {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        toast.error("Mohon periksa input Anda");
      } else if (error.response?.status === 409) {
        // Handle schedule conflict (409 Conflict)
        toast.error(
          error.response?.data?.message ||
            "Jadwal konseling bertabrakan. Silakan pilih waktu lain."
        );
      } else if (error.response?.data?.message) {
        // Handle other API errors
        toast.error(error.response.data.message);
      } else {
        toast.error("Gagal menjadwalkan konsultasi. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedDate(new Date());
    setSelectedTimeStart("");
    setSelectedTimeEnd("");
    setFormData({
      message: "",
      expertName: admins.length > 0 ? admins[0].user_id : "",
      description: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 my-8 relative max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 bg-white rounded-full"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Jadwalkan Konseling
          </h3>
          <div className="flex justify-center mb-4">
            <img src={clockLogo} alt="clock" className="h-24 w-24" />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Date Input - Calendar Popover */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hari / tanggal
            </label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.selectedDate && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setDateOpen(false);
                    // Reset time selections when date changes to today
                    if (
                      date &&
                      date.toDateString() === new Date().toDateString()
                    ) {
                      // Clear time if it's now in the past
                      if (
                        selectedTimeStart &&
                        isTimeSlotDisabled(selectedTimeStart, date)
                      ) {
                        setSelectedTimeStart("");
                      }
                      if (
                        selectedTimeEnd &&
                        isTimeSlotDisabled(selectedTimeEnd, date)
                      ) {
                        setSelectedTimeEnd("");
                      }
                    }
                    if (errors.selectedDate) {
                      setErrors((prev) => ({ ...prev, selectedDate: "" }));
                    }
                  }}
                  disabled={(date) => {
                    // Disable past dates
                    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                      return true;
                    }
                    // Disable fully booked dates - use LOCAL timezone format
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");
                    const dateStr = `${year}-${month}-${day}`;
                    return fullyBookedDates.has(dateStr);
                  }}
                  captionLayout="dropdown"
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            {errors.selectedDate && (
              <p className="text-red-500 text-xs mt-1">{errors.selectedDate}</p>
            )}
          </div>

          {/* Time Input - Time Picker Popover */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jam (Durasi: 1 jam)
            </label>
            <div className="flex gap-1 items-center">
              {/* Start Time */}
              <div className="flex-1">
                <Popover open={startTimeOpen} onOpenChange={setStartTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedTimeStart && "text-muted-foreground",
                        errors.selectedTimeStart && "border-red-500"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedTimeStart || "Pilih waktu"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="grid grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                      {getAvailableTimeSlots().map((time) => {
                        const isDisabled = isTimeSlotDisabled(
                          time,
                          selectedDate
                        );
                        return (
                          <Button
                            key={time}
                            variant={
                              selectedTimeStart === time ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              if (!isDisabled) {
                                setSelectedTimeStart(time);
                                // Auto-set end time to 1 hour later
                                const [hours, minutes] = time
                                  .split(":")
                                  .map(Number);
                                let endHour = hours + 1;
                                const endTime = `${endHour
                                  .toString()
                                  .padStart(2, "0")}:${minutes
                                  .toString()
                                  .padStart(2, "0")}`;
                                setSelectedTimeEnd(endTime);
                                setStartTimeOpen(false);
                                // Clear error when user selects time
                                if (errors.selectedTimeStart) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    selectedTimeStart: "",
                                  }));
                                }
                              }
                            }}
                            disabled={isDisabled}
                            className="h-10"
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Minus />
              {/* End Time - Auto calculated (1 hour after start) */}
              <div className="flex-1">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedTimeEnd && "text-muted-foreground"
                  )}
                  disabled
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {selectedTimeEnd || "waktu selesai"}
                </Button>
              </div>
            </div>
            {(errors.selectedTimeStart || errors.selectedTimeEnd) && (
              <p className="text-red-500 text-xs mt-1">
                {errors.selectedTimeStart || errors.selectedTimeEnd}
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error when user types
                if (errors.message) {
                  setErrors((prev) => ({ ...prev, message: "" }));
                }
              }}
              rows={1}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                errors.message && "border-red-500"
              )}
              placeholder="Tuliskan Topic Anda..."
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1">{errors.message}</p>
            )}

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error when user types
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: "" }));
                }
              }}
              rows={4}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                errors.description && "border-red-500"
              )}
              placeholder="Tuliskan Deskripsi Anda..."
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Expert Name Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ahli
            </label>
            <select
              name="expertName"
              value={formData.expertName}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error when user selects
                if (errors.expertName) {
                  setErrors((prev) => ({ ...prev, expertName: "" }));
                }
              }}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white",
                errors.expertName && "border-red-500"
              )}
            >
              {admins.length === 0 ? (
                <option value="">Loading experts...</option>
              ) : (
                <>
                  <option value="" disabled>
                    Pilih Ahli
                  </option>
                  {admins.map((admin) => (
                    <option key={admin.user_id} value={admin.user_id}>
                      {admin.firstname} {admin.lastname}
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.expertName && (
              <p className="text-red-500 text-xs mt-1">{errors.expertName}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-2xl transition-all"
            >
              {submitting ? "Menjadwalkan..." : "Simpan perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalJadwalkanKonseling;
