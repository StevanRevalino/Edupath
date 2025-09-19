import React, { useState, useEffect } from "react";
import { ChevronLeft, Clock, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import conselingHeroIcon from "../../assets/icons/Conseling-hero-icon.png";
import {
  consultationService,
  type Consultation,
} from "../../services/consultationService";
import TokenManager from "../../utils/tokenManager";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

const Konseling = () => {
  const [showModal, setShowModal] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date()
  );
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>("");
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<string>("");
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    expertName: "", // Will be set when admins are loaded
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch consultations when component mounts
  useEffect(() => {
    fetchConsultations();
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = TokenManager.getToken();
      const response = await fetch('http://localhost:5000/api/users/admins', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setAdmins(data.data);
          
          // Set default expert to first admin if available
          if (data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              expertName: data.data[0].user_id
            }));
          }
        }
      } else {
        // Fallback to mock data if API fails
        const fallbackAdmins = [
          { user_id: 'ADMIN001', firstname: 'Dr. Ahmad', lastname: 'Santoso' },
          { user_id: 'ADMIN002', firstname: 'Dr. Sari', lastname: 'Indrawati' },
        ];
        setAdmins(fallbackAdmins);
        setFormData(prev => ({
          ...prev,
          expertName: fallbackAdmins[0].user_id
        }));
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      // Fallback with mock data
      const fallbackAdmins = [
        { user_id: 'ADMIN001', firstname: 'Dr. Ahmad', lastname: 'Santoso' },
        { user_id: 'ADMIN002', firstname: 'Dr. Sari', lastname: 'Indrawati' },
      ];
      setAdmins(fallbackAdmins);
      setFormData(prev => ({
        ...prev,
        expertName: fallbackAdmins[0].user_id
      }));
    }
  };

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await consultationService.getConsultations();
      if (response.success && response.data) {
        setConsultations(response.data);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      // You can add a toast notification here
    } finally {
      setLoading(false);
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
        alert("Please fill in all required fields");
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
        admin_id: formData.expertName, // Use selected admin ID
        topic: formData.message,
        consultation_date: consultationDateTime.toISOString(),
        notes: `Scheduled for ${selectedTimeStart} - ${selectedTimeEnd} WIB. Expert: ${admins.find(admin => admin.user_id === formData.expertName)?.firstname || 'Unknown'} ${admins.find(admin => admin.user_id === formData.expertName)?.lastname || ''}`,
      };

      const response = await consultationService.createConsultation(
        consultationData
      );

      if (response.success) {
        alert("Consultation scheduled successfully!");
        setShowModal(false);
        setSelectedDate(new Date());
        setSelectedTimeStart("");
        setSelectedTimeEnd("");
        setFormData({
          message: "",
          expertName: admins.length > 0 ? admins[0].user_id : "",
        });
        // Refresh consultations list
        fetchConsultations();
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

  return (
    <div className="min-h-screen bg-white">
      {/* Sesi Konseling Section */}
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-12">
            Sesi Konseling
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Jadwalkan Konseling */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Jadwalkan Konseling
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-600"
                >
                  <span className="text-2xl mr-3">+</span>
                  <span className="text-sm">
                    Jadwalkan sesi bimbingan konseling baru...
                  </span>
                </button>
              </div>

              {/* Riwayat Konseling */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Riwayat Konseling
                </h3>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading consultations...</p>
                    </div>
                  ) : consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <div
                        key={consultation.consultation_id}
                        onClick={() => setSelectedConsultation(consultation)}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-white text-xs px-2 py-1 rounded ${
                              consultation.status === "COMPLETED"
                                ? "bg-green-600"
                                : consultation.status === "ACCEPTED"
                                ? "bg-blue-600"
                                : consultation.status === "PENDING"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                            }`}
                          >
                            {consultation.status === "COMPLETED"
                              ? "Sesi telah dilakukan"
                              : consultation.status === "ACCEPTED"
                              ? "Sesi diterima"
                              : consultation.status === "PENDING"
                              ? "Menunggu konfirmasi"
                              : "Sesi ditolak"}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{consultation.consultation_id}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {consultation.admin_id}{" "}
                          {/* You might want to fetch admin name */}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {new Date(
                            consultation.consultation_date
                          ).toLocaleDateString("id-ID")}{" "}
                          -{" "}
                          {new Date(
                            consultation.consultation_date
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        Belum ada riwayat konseling
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Info Panel */}
            <div className="bg-white rounded-xl shadow-md p-6 h-fit">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Info tentang sesi
              </h3>

              {selectedConsultation ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
                    konseling #{selectedConsultation.consultation_id}
                  </h4>

                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <label className="text-sm font-medium text-gray-600">
                        Status:
                      </label>
                      <p
                        className={`text-sm font-semibold ${
                          selectedConsultation.status === "COMPLETED"
                            ? "text-green-600"
                            : selectedConsultation.status === "ACCEPTED"
                            ? "text-blue-600"
                            : selectedConsultation.status === "PENDING"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedConsultation.status === "COMPLETED"
                          ? "Selesai"
                          : selectedConsultation.status === "ACCEPTED"
                          ? "Diterima"
                          : selectedConsultation.status === "PENDING"
                          ? "Menunggu"
                          : "Ditolak"}
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-sm font-medium text-gray-600">
                        Tanggal & Waktu:
                      </label>
                      <p className="text-sm text-gray-800">
                        {new Date(
                          selectedConsultation.consultation_date
                        ).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-800">
                        {new Date(
                          selectedConsultation.consultation_date
                        ).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-sm font-medium text-gray-600">
                        Konselor:
                      </label>
                      <p className="text-sm text-gray-800">
                        {selectedConsultation.admin_id}
                      </p>
                    </div>

                    <div className="border-b pb-3">
                      <label className="text-sm font-medium text-gray-600">
                        Topik:
                      </label>
                      <p className="text-sm text-gray-800">
                        {selectedConsultation.topic}
                      </p>
                    </div>

                    {selectedConsultation.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Catatan:
                        </label>
                        <p className="text-sm text-gray-800">
                          {selectedConsultation.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 text-xs text-gray-500 text-center">
                      Dibuat:{" "}
                      {new Date(
                        selectedConsultation.created_at
                      ).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 text-center mb-8">
                    konseling #
                    {Array(8)
                      .fill(0)
                      .map(() => "x")
                      .join("")}
                  </h4>

                  {/* Placeholder content for session info */}
                  <div className="space-y-4 text-center text-gray-500">
                    <p className="text-sm">
                      Pilih sesi konseling dari riwayat untuk melihat detail
                      informasi
                    </p>
                    <div className="bg-gray-100 rounded-lg p-8">
                      <p className="text-xs">
                        Detail sesi akan ditampilkan di sini
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Jadwalkan Konseling */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
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
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
                  <Clock className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Date Input - Calendar Popover */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hari / tanggal
                </label>
                <Popover>
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
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      captionLayout="dropdown"
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Input - Time Picker Popover */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Mulai
                  </label>
                  <Popover>
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
                            onClick={() => setSelectedTimeStart(time)}
                            className="h-10"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waktu Selesai
                  </label>
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

              {/* Message Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perihal
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tuliskan pesan Anda..."
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
                      <option value="" disabled>Pilih Ahli</option>
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
      )}
    </div>
  );
};

export default Konseling;
