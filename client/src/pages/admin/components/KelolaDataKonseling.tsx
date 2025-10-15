import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";
import { triggerNotificationRefresh } from "../../../utils/notificationEvents";
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

// Generate time slots (8:00 - 17:00)
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

interface Consultation {
  consultation_id: string;
  murid_id: string;
  topic: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  consultation_date: string;
  consultation_time: string;
  notes?: string;
  created_at: string;
  is_active: boolean;
  murid: {
    firstname: string;
    lastname: string;
    email: string;
    kelas: number | null;
  };
}

const KelolaDataKonseling = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "pending" | "active" | "completed" | "declined"
  >("active");
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(
    new Date()
  );
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleEndTime, setRescheduleEndTime] = useState<string>("");
  const [rescheduleReason, setRescheduleReason] = useState<string>("");
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const API_URL = import.meta.env.VITE_API_URL;

  // Auto-complete expired consultations
  const autoCompleteExpiredConsultations = async () => {
    try {
      const token = TokenManager.getToken();
      await axios.post(
        `${API_URL}/api/consultations/auto-complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // Silent error - just log it, don't show to user
      console.error("Error auto-completing consultations:", error);
    }
  };

  // Fetch consultations from API
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        // First, auto-complete any expired consultations
        await autoCompleteExpiredConsultations();

        const response = await axios.get(`${API_URL}/api/consultations`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setConsultations(response.data.data || []);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            toast.error("Session expired. Silakan login ulang.");
            TokenManager.logout();
            window.location.href = "/login";
          } else {
            toast.error("Gagal mengambil data konseling");
          }
        } else {
          console.error("Error fetching consultations:", error);
          toast.error("Gagal mengambil data konseling");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();

    // Set interval to auto-complete expired consultations every 1 minute
    const interval = setInterval(() => {
      autoCompleteExpiredConsultations();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500 font-semibold";
      case "ACCEPTED":
        return "text-green-500 font-semibold";
      case "DECLINED":
        return "text-red-500 font-semibold";
      case "COMPLETED":
        return "text-blue-500 font-semibold";
      default:
        return "text-gray-500 font-semibold";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "ACCEPTED":
        return "Accepted";
      case "DECLINED":
        return "Declined";
      case "COMPLETED":
        return "Completed";
      default:
        return status;
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const fullName =
      `${consultation.murid.firstname} ${consultation.murid.lastname}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.topic.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by active tab
    const matchesTab =
      activeTab === "pending"
        ? consultation.status === "PENDING"
        : activeTab === "active"
        ? consultation.status === "ACCEPTED"
        : activeTab === "completed"
        ? consultation.status === "COMPLETED"
        : consultation.status === "DECLINED";

    return matchesSearch && matchesTab;
  });

  const handleUpdateStatus = async (
    consultationId: string,
    newStatus: string
  ) => {
    try {
      // If declining, show a modal to get the decline reason
      if (newStatus === "DECLINED") {
        const result = await Swal.fire({
          title: "Tolak Konseling",
          html: `
            <div class="text-left">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Alasan penolakan <span class="text-red-500">*</span>
              </label>
              <textarea
                id="decline-notes"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
                placeholder="Masukkan alasan mengapa konseling ditolak..."
              ></textarea>
            </div>
          `,
          imageUrl: questionIcon,
          imageWidth: 80,
          imageHeight: 90,
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6CCBFF",
          confirmButtonText: "Tolak Konseling",
          cancelButtonText: "Batal",
          preConfirm: () => {
            const notes = (
              document.getElementById("decline-notes") as HTMLTextAreaElement
            )?.value;
            if (!notes || notes.trim() === "") {
              Swal.showValidationMessage("Alasan penolakan harus diisi");
              return false;
            }
            return notes;
          },
        });

        if (result.isConfirmed && result.value) {
          const token = TokenManager.getToken();

          await axios.patch(
            `${API_URL}/api/consultations/${consultationId}/status`,
            { status: newStatus, admin_notes: result.value },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setConsultations(
            consultations.map((consultation) =>
              consultation.consultation_id === consultationId
                ? {
                    ...consultation,
                    status: newStatus as Consultation["status"],
                    admin_notes: result.value,
                    is_active: false, // Set is_active to false when declined
                  }
                : consultation
            )
          );

          toast.success("Konseling berhasil ditolak");
          triggerNotificationRefresh(); // Refresh notification badge
        }
      } else {
        // For other status changes (ACCEPTED), use the regular confirmation
        const result = await Swal.fire({
          title: "Apakah Anda yakin?",
          text: `Anda akan mengubah status konseling menjadi "${getStatusText(
            newStatus
          )}".`,
          imageUrl: questionIcon,
          imageWidth: 80,
          imageHeight: 90,
          showCancelButton: true,
          confirmButtonColor: "#6CCBFF",
          cancelButtonColor: "#d33",
          confirmButtonText: "Ya, ubah status",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          const token = TokenManager.getToken();

          await axios.patch(
            `${API_URL}/api/consultations/${consultationId}/status`,
            { status: newStatus },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          setConsultations(
            consultations.map((consultation) =>
              consultation.consultation_id === consultationId
                ? {
                    ...consultation,
                    status: newStatus as Consultation["status"],
                  }
                : consultation
            )
          );

          toast.success("Status konseling berhasil diperbarui");
          triggerNotificationRefresh(); // Refresh notification badge
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error("Gagal memperbarui status konseling");
        }
      } else {
        console.error("Error updating consultation:", error);
        toast.error("Gagal memperbarui status konseling");
      }
    }
  };

  const handleViewDetail = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedConsultation(null);
  };

  const handleReschedule = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setRescheduleDate(new Date());
    setRescheduleTime("");
    setRescheduleEndTime("");
    setRescheduleReason("");
    setIsRescheduleModalOpen(true);
    setIsDetailModalOpen(false); // Close detail modal
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
    setRescheduleDate(new Date());
    setRescheduleTime("");
    setRescheduleEndTime("");
    setRescheduleReason("");
  };

  const handleSubmitReschedule = async () => {
    if (
      !selectedConsultation ||
      !rescheduleDate ||
      !rescheduleTime ||
      !rescheduleReason.trim()
    ) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    try {
      const token = TokenManager.getToken();

      // Combine date and time
      const [hours, minutes] = rescheduleTime.split(":");
      const newDateTime = new Date(rescheduleDate);
      newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await axios.patch(
        `${API_URL}/api/consultations/${selectedConsultation.consultation_id}/reschedule`,
        {
          newDate: newDateTime.toISOString(),
          rescheduleReason: rescheduleReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state with data from server to ensure consistency
      const updatedConsultation = response.data.data;
      setConsultations(
        consultations.map((c) =>
          c.consultation_id === selectedConsultation.consultation_id
            ? updatedConsultation
            : c
        )
      );

      toast.success("Konseling berhasil di-reschedule");
      triggerNotificationRefresh();
      handleCloseRescheduleModal();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error(
            error.response?.data?.message || "Gagal reschedule konseling"
          );
        }
      } else {
        console.error("Error rescheduling consultation:", error);
        toast.error("Gagal reschedule konseling");
      }
    }
  };

  // Fetch booked slots for selected date
  const fetchBookedSlots = async (date: Date) => {
    try {
      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/consultations/booked-slots`,
        {
          params: {
            date: format(date, "yyyy-MM-dd"),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookedSlots(response.data.data || []);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
    }
  };

  // Update booked slots when reschedule date changes
  useEffect(() => {
    if (rescheduleDate && isRescheduleModalOpen) {
      fetchBookedSlots(rescheduleDate);
    }
  }, [rescheduleDate, isRescheduleModalOpen]);

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

  return (
    <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 flex flex-col overflow-hidden">
      <PageHeader
        title="Kelola Data Konseling"
        description="Kelola dan pantau sesi konseling dengan murid."
      />

      {/* Integrated Control Panel: Tabs + Search */}
      <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        {/* Tab Navigation with Inline Stats */}
        <div className="grid grid-cols-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-5 transition-all duration-200 relative ${
              activeTab === "pending"
                ? "bg-gradient-to-b from-blue-50 to-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center space-y-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  activeTab === "pending" ? "text-yellow-700" : "text-gray-500"
                }`}
              >
                Pending
              </span>
              <span
                className={`text-3xl font-bold transition-colors ${
                  activeTab === "pending" ? "text-yellow-600" : "text-gray-400"
                }`}
              >
                {consultations.filter((c) => c.status === "PENDING").length}
              </span>
            </div>
            {activeTab === "pending" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-5 transition-all duration-200 relative ${
              activeTab === "active"
                ? "bg-gradient-to-b from-blue-50 to-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center space-y-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  activeTab === "active" ? "text-blue-700" : "text-gray-500"
                }`}
              >
                Active
              </span>
              <span
                className={`text-3xl font-bold transition-colors ${
                  activeTab === "active" ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {consultations.filter((c) => c.status === "ACCEPTED").length}
              </span>
            </div>
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-5 transition-all duration-200 relative ${
              activeTab === "completed"
                ? "bg-gradient-to-b from-green-50 to-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center space-y-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  activeTab === "completed" ? "text-green-700" : "text-gray-500"
                }`}
              >
                Completed
              </span>
              <span
                className={`text-3xl font-bold transition-colors ${
                  activeTab === "completed" ? "text-green-600" : "text-gray-400"
                }`}
              >
                {consultations.filter((c) => c.status === "COMPLETED").length}
              </span>
            </div>
            {activeTab === "completed" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
            )}
          </button>

          <button
            onClick={() => setActiveTab("declined")}
            className={`px-4 py-5 transition-all duration-200 relative ${
              activeTab === "declined"
                ? "bg-gradient-to-b from-red-50 to-white"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center space-y-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  activeTab === "declined" ? "text-red-700" : "text-gray-500"
                }`}
              >
                Declined
              </span>
              <span
                className={`text-3xl font-bold transition-colors ${
                  activeTab === "declined" ? "text-red-600" : "text-gray-400"
                }`}
              >
                {consultations.filter((c) => c.status === "DECLINED").length}
              </span>
            </div>
            {activeTab === "declined" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
            )}
          </button>
        </div>

        {/* Integrated Search Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari nama murid atau topik konseling..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <DataTableContainer loading={loading}>
        <div className="flex flex-col overflow-hidden">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="bg-gray-50 grid grid-cols-5 gap-4 px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider flex-shrink-0 border-b border-gray-200">
              <div>Murid</div>
              <div>Topik</div>
              <div>Jadwal</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Data Rows - Scrollable */}
            <div className="overflow-y-auto">
              {filteredConsultations.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-gray-500">
                    {searchTerm
                      ? "Tidak ada data yang sesuai dengan pencarian"
                      : "Belum ada data konseling"}
                  </div>
                </div>
              ) : (
                <div className="bg-white">
                  {filteredConsultations.map((consultation) => (
                    <div
                      key={consultation.consultation_id}
                      className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 items-center"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#050051] font-semibold text-xl">
                            {consultation.murid.firstname
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-md font-semibold text-gray-900">
                            {`${consultation.murid.firstname} ${consultation.murid.lastname}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.murid.kelas}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-900 tex-wrap overflow-hidden text-ellipsis">
                          {consultation.topic}
                        </div>
                        {consultation.notes && (
                          <div className="text-sm mt-1">
                            {consultation.status === "DECLINED" ? (
                              <div className="bg-red-50 border border-red-200 rounded-md p-2 max-w-[250px]">
                                <div className="text-xs font-semibold text-red-700 mb-1">
                                  {consultation.notes.includes(
                                    "[DIBATALKAN OLEH MURID]"
                                  )
                                    ? "Dibatalkan Oleh Murid:"
                                    : "Alasan Penolakan:"}
                                </div>
                                <div className="text-xs text-red-600 text-wrap overflow-hidden text-ellipsis">
                                  {consultation.notes.replace(
                                    "[DIBATALKAN OLEH MURID] ",
                                    ""
                                  )}
                                </div>
                              </div>
                            ) : consultation.notes.includes(
                                "[DIJADWALKAN ULANG]"
                              ) ? (
                              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 max-w-[250px]">
                                <div className="text-xs font-semibold text-blue-700 mb-1">
                                  Dijadwalkan Ulang:
                                </div>
                                <div className="text-xs text-blue-600 text-wrap overflow-hidden text-ellipsis">
                                  {consultation.notes.replace(
                                    "[DIJADWALKAN ULANG] ",
                                    ""
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className="text-gray-500 max-w-[200px] text-wrap overflow-hidden text-ellipsis"
                                title={consultation.notes}
                              >
                                {consultation.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        <div>
                          {new Date(
                            consultation.consultation_date
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div>
                          {(() => {
                            const startTime = new Date(
                              consultation.consultation_date
                            );
                            const endTime = new Date(
                              startTime.getTime() + 60 * 60 * 1000
                            ); // +1 hour
                            return `${startTime.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} - ${endTime.toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`;
                          })()}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            consultation.status
                          )}`}
                        >
                          <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                          <span>{getStatusText(consultation.status)}</span>
                        </span>
                        {consultation.notes?.includes(
                          "[DIJADWALKAN ULANG]"
                        ) && (
                          <div className="mt-2 text-xs text-blue-600 font-medium">
                            📅 Dijadwalkan Ulang
                          </div>
                        )}
                        {consultation.notes?.includes(
                          "[DIBATALKAN OLEH MURID]"
                        ) && (
                          <div className="mt-2 text-xs text-red-600 font-medium">
                            ❌ Dibatalkan Murid
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {consultation.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  consultation.consultation_id,
                                  "ACCEPTED"
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  consultation.consultation_id,
                                  "DECLINED"
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        {consultation.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View Details</span>
                          </button>
                        )}
                        {consultation.status === "DECLINED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white text-sm rounded-full hover:bg-gray-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View Details</span>
                          </button>
                        )}
                        {consultation.status === "COMPLETED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>View Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View - Hidden on Desktop */}
          <div className="lg:hidden overflow-y-auto">
            {filteredConsultations.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  {searchTerm
                    ? "Tidak ada data yang sesuai dengan pencarian"
                    : "Belum ada data konseling"}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredConsultations.map((consultation) => (
                  <div
                    key={consultation.consultation_id}
                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    {/* Header dengan nama dan action buttons */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-12 h-12 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#050051] font-bold text-lg">
                            {consultation.murid.firstname
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-lg font-semibold text-gray-900">
                            {`${consultation.murid.firstname} ${consultation.murid.lastname}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {consultation.murid.kelas}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2 ml-2">
                        {consultation.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  consultation.consultation_id,
                                  "ACCEPTED"
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors whitespace-nowrap"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  consultation.consultation_id,
                                  "DECLINED"
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors whitespace-nowrap"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>Decline</span>
                            </button>
                          </>
                        )}
                        {consultation.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>Details</span>
                          </button>
                        )}
                        {consultation.status === "DECLINED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600 transition-colors whitespace-nowrap"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>Details</span>
                          </button>
                        )}
                        {consultation.status === "COMPLETED" && (
                          <button
                            onClick={() => handleViewDetail(consultation)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors whitespace-nowrap"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>Details</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Topik dan Notes */}
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        Topik: {consultation.topic}
                      </div>
                      {consultation.notes && (
                        <div className="text-sm mt-2">
                          {consultation.status === "DECLINED" ? (
                            <div className="bg-red-50 border border-red-200 rounded-md p-2">
                              <div className="text-xs font-semibold text-red-700 mb-1">
                                {consultation.notes.includes(
                                  "[DIBATALKAN OLEH MURID]"
                                )
                                  ? "Dibatalkan Oleh Murid:"
                                  : "Alasan Penolakan:"}
                              </div>
                              <div className="text-xs text-red-600">
                                {consultation.notes.replace(
                                  "[DIBATALKAN OLEH MURID] ",
                                  ""
                                )}
                              </div>
                            </div>
                          ) : consultation.notes.includes(
                              "[DIJADWALKAN ULANG]"
                            ) ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                              <div className="text-xs font-semibold text-blue-700 mb-1">
                                Dijadwalkan Ulang:
                              </div>
                              <div className="text-xs text-blue-600">
                                {consultation.notes.replace(
                                  "[DIJADWALKAN ULANG] ",
                                  ""
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              Catatan: {consultation.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Jadwal dan Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-sm text-gray-500">
                        <strong>Jadwal:</strong>{" "}
                        {new Date(
                          consultation.consultation_date
                        ).toLocaleDateString("id-ID")}{" "}
                        {(() => {
                          const startTime = new Date(
                            consultation.consultation_date
                          );
                          const endTime = new Date(
                            startTime.getTime() + 60 * 60 * 1000
                          );
                          return `${startTime.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${endTime.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`;
                        })()}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(
                            consultation.status
                          )}`}
                        >
                          <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                          <span>{getStatusText(consultation.status)}</span>
                        </span>
                        {consultation.notes?.includes(
                          "[DIJADWALKAN ULANG]"
                        ) && (
                          <div className="text-xs text-blue-600 font-medium">
                            📅 Dijadwalkan Ulang
                          </div>
                        )}
                        {consultation.notes?.includes(
                          "[DIBATALKAN OLEH MURID]"
                        ) && (
                          <div className="text-xs text-red-600 font-medium">
                            ❌ Dibatalkan Murid
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DataTableContainer>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleCloseDetailModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Detail Konseling
              </h2>
              <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Informasi Murid
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#050051] font-bold text-2xl">
                      {selectedConsultation.murid.firstname
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {`${selectedConsultation.murid.firstname} ${selectedConsultation.murid.lastname}`.trim()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedConsultation.murid.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      Kelas: {selectedConsultation.murid.kelas || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Status
                  </div>
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedConsultation.status
                    )}`}
                  >
                    <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                    <span>{getStatusText(selectedConsultation.status)}</span>
                  </span>
                </div>

                {/* Consultation ID */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    ID Konseling
                  </div>
                  <div className="text-lg font-mono font-semibold text-gray-900">
                    {selectedConsultation.consultation_id}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Jadwal Konseling
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Tanggal</div>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-semibold">
                        {new Date(
                          selectedConsultation.consultation_date
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Waktu</div>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-semibold">
                        {(() => {
                          const startTime = new Date(
                            selectedConsultation.consultation_date
                          );
                          const endTime = new Date(
                            startTime.getTime() + 60 * 60 * 1000
                          );
                          return `${startTime.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} - ${endTime.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`;
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Topik Konseling
                </div>
                <div className="text-base text-gray-900">
                  {selectedConsultation.topic}
                </div>
              </div>

              {/* Notes */}
              {selectedConsultation.notes && (
                <div
                  className={`rounded-lg p-4 ${
                    selectedConsultation.notes.includes(
                      "[DIBATALKAN OLEH MURID]"
                    )
                      ? "bg-red-50 border border-red-200"
                      : selectedConsultation.notes.includes(
                          "[DIJADWALKAN ULANG]"
                        )
                      ? "bg-blue-50 border border-blue-200"
                      : selectedConsultation.status === "DECLINED"
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold uppercase tracking-wide mb-2 ${
                      selectedConsultation.notes.includes(
                        "[DIBATALKAN OLEH MURID]"
                      ) || selectedConsultation.status === "DECLINED"
                        ? "text-red-700"
                        : selectedConsultation.notes.includes(
                            "[DIJADWALKAN ULANG]"
                          )
                        ? "text-blue-700"
                        : "text-gray-500"
                    }`}
                  >
                    {selectedConsultation.notes.includes(
                      "[DIBATALKAN OLEH MURID]"
                    )
                      ? "Alasan Pembatalan (Oleh Murid)"
                      : selectedConsultation.notes.includes(
                          "[DIJADWALKAN ULANG]"
                        )
                      ? "Alasan Reschedule"
                      : selectedConsultation.status === "DECLINED"
                      ? "Alasan Penolakan"
                      : "Catatan"}
                  </div>
                  <div
                    className={`text-base ${
                      selectedConsultation.notes.includes(
                        "[DIBATALKAN OLEH MURID]"
                      ) || selectedConsultation.status === "DECLINED"
                        ? "text-red-700"
                        : selectedConsultation.notes.includes(
                            "[DIJADWALKAN ULANG]"
                          )
                        ? "text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {selectedConsultation.notes
                      .replace("[DIBATALKAN OLEH MURID] ", "")
                      .replace("[DIJADWALKAN ULANG] ", "")}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end gap-3">
              {selectedConsultation.status === "ACCEPTED" && (
                <button
                  onClick={() => handleReschedule(selectedConsultation)}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Reschedule
                </button>
              )}
              <button
                onClick={handleCloseDetailModal}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedConsultation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleCloseRescheduleModal}
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
                  {selectedConsultation.murid.firstname}{" "}
                  {selectedConsultation.murid.lastname}
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
                  {new Date(
                    selectedConsultation.consultation_date
                  ).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  pukul{" "}
                  {new Date(
                    selectedConsultation.consultation_date
                  ).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                                  rescheduleTime === slot
                                    ? "default"
                                    : "outline"
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
                onClick={handleCloseRescheduleModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitReschedule}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaDataKonseling;
