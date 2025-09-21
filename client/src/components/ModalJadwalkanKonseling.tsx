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
import clockLogo from "../assets/icons/clock-Icon.png";
import { consultationService } from "../services/consultationService";
import TokenManager from "../utils/tokenManager";
import toast from "react-hot-toast";
import axios from "axios";
import {
  konselingSchema,
  type KonselingFormData,
} from "../schema/KonselingSchema";

// Generate time slots
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

interface Admin {
  user_id: string;
  firstname: string;
  lastname: string;
}

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
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    message: "",
    expertName: "",
    notes: "",
  });

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
    }
  }, [isOpen]);

  const fetchAdmins = async () => {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        "http://localhost:5000/api/users/admins",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
        notes: formData.notes,
        expertName: formData.expertName,
      };

      // Validate using Yup schema
      await konselingSchema.validate(validationData, { abortEarly: false });

      // Combine date and time for consultation_date
      const consultationDateTime = new Date(selectedDate!);
      const [hours, minutes] = selectedTimeStart.split(":");
      consultationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

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
        consultation_date: consultationDateTime.toISOString(),
        notes: formData.notes,
      };

      const response = await consultationService.createConsultation(
        consultationData
      );

      if (response.success) {
        toast.success("Konsultasi berhasil dijadwalkan!");
        // Reset form
        setSelectedDate(new Date());
        setSelectedTimeStart("");
        setSelectedTimeEnd("");
        setFormData({
          message: "",
          expertName: admins.length > 0 ? admins[0].user_id : "",
          notes: "",
        });
        setErrors({});
        onSuccess(); // Call parent callback to refresh data
        onClose(); // Close modal
      } else {
        toast.error(response.message || "Gagal menjadwalkan konsultasi");
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
      notes: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
                    // Clear error when user selects a date
                    if (errors.selectedDate) {
                      setErrors((prev) => ({ ...prev, selectedDate: "" }));
                    }
                  }}
                  disabled={(date) => date < new Date()}
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
              Jam
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
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={
                            selectedTimeStart === time ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedTimeStart(time);
                            setStartTimeOpen(false);
                            // Clear error when user selects time
                            if (errors.selectedTimeStart) {
                              setErrors((prev) => ({
                                ...prev,
                                selectedTimeStart: "",
                              }));
                            }
                          }}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Minus />
              {/* End Time */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedTimeEnd && "text-muted-foreground",
                        errors.selectedTimeEnd && "border-red-500"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {selectedTimeEnd || "Pilih waktu"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="grid grid-cols-3 gap-2 p-4 max-h-60 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={
                            selectedTimeEnd === time ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedTimeEnd(time);
                            // Clear error when user selects time
                            if (errors.selectedTimeEnd) {
                              setErrors((prev) => ({
                                ...prev,
                                selectedTimeEnd: "",
                              }));
                            }
                          }}
                          className="h-10"
                          disabled={
                            !!(selectedTimeStart && time <= selectedTimeStart)
                          }
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
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
              name="notes"
              value={formData.notes}
              onChange={(e) => {
                handleInputChange(e);
                // Clear error when user types
                if (errors.notes) {
                  setErrors((prev) => ({ ...prev, notes: "" }));
                }
              }}
              rows={4}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                errors.notes && "border-red-500"
              )}
              placeholder="Tuliskan Deskripsi Anda..."
            />
            {errors.notes && (
              <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
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
              className="w-full bg-[#6CCBFF] hover:bg-[#6CCBFF]/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-2xl transition-all"
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
