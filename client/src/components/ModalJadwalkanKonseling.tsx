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
      const response = await fetch("http://localhost:5000/api/users/admins", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAdmins(data.data);

          // Set default expert to first admin if available
          if (data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              expertName: data.data[0].user_id,
            }));
          }
        }
      } else {
        console.error("Failed to fetch admins");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Validate form data
      if (
        !selectedDate ||
        !selectedTimeStart ||
        !selectedTimeEnd ||
        !formData.message
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Combine date and time for consultation_date
      const consultationDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeStart.split(":");
      consultationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Get user ID from token
      const userData = TokenManager.getUserData();

      if (!userData.userId) {
        alert("User not authenticated");
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
        alert("Consultation scheduled successfully!");
        // Reset form
        setSelectedDate(new Date());
        setSelectedTimeStart("");
        setSelectedTimeEnd("");
        setFormData({
          message: "",
          expertName: admins.length > 0 ? admins[0].user_id : "",
          notes: "",
        });
        onSuccess(); // Call parent callback to refresh data
        onClose(); // Close modal
      } else {
        alert(response.message || "Failed to schedule consultation");
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      alert("Failed to schedule consultation. Please try again.");
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
                    !selectedDate && "text-muted-foreground"
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
                  }}
                  disabled={(date) => date < new Date()}
                  captionLayout="dropdown"
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Input - Time Picker Popover */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jam
            </label>
            <div className="flex gap-1 items-center">
              {/* Start Time */}
              <div>
                <Popover open={startTimeOpen} onOpenChange={setStartTimeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedTimeStart && "text-muted-foreground"
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
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedTimeEnd && "text-muted-foreground"
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
                          onClick={() => setSelectedTimeEnd(time)}
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
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tuliskan Topic Anda..."
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tuliskan Deskripsi Anda..."
            />
          </div>

          {/* Expert Name Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ahli
            </label>
            <select
              name="expertName"
              value={formData.expertName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
