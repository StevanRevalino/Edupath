import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";
import { triggerNotificationRefresh } from "../../../utils/notificationEvents";
import ConsultationFilters from "../kelolaKonseling/Components/ConsultationFilters";
import ConsultationDetailModal from "../kelolaKonseling/Components/ConsultationDetailModal";
import RescheduleModal from "../kelolaKonseling/Components/RescheduleModal";
import ConsultationTable from "../kelolaKonseling/Components/ConsultationTable";
import ConsultationCards from "../kelolaKonseling/Components/ConsultationCards";

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
  description?: string;
  admin_notes?: string;
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
    }, 60000);

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
                    is_active: false,
                  }
                : consultation
            )
          );

          toast.success("Konseling berhasil ditolak");
          triggerNotificationRefresh();
        }
      } else {
        // For other status changes (ACCEPTED)
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
          triggerNotificationRefresh();
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
    setIsRescheduleModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
  };

  const handleSubmitReschedule = async (data: {
    date: Date;
    time: string;
    endTime: string;
    reason: string;
  }) => {
    if (!selectedConsultation) return;

    try {
      const token = TokenManager.getToken();

      // Combine date and time
      const [hours, minutes] = data.time.split(":");
      const newDateTime = new Date(data.date);
      newDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await axios.patch(
        `${API_URL}/api/consultations/${selectedConsultation.consultation_id}/reschedule`,
        {
          newDate: newDateTime.toISOString(),
          rescheduleReason: data.reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
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

  const handleCancelConsultation = async (consultationId: string) => {
    const result = await Swal.fire({
      title: "Batalkan Konseling?",
      text: "Konseling akan dibatalkan dan murid akan diberitahu.",
      imageUrl: questionIcon,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6CCBFF",
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const token = TokenManager.getToken();

        await axios.patch(
          `${API_URL}/api/consultations/${consultationId}/status`,
          { status: "DECLINED", admin_notes: "Dibatalkan oleh admin" },
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
                  status: "DECLINED" as Consultation["status"],
                  is_active: false,
                }
              : consultation
          )
        );

        toast.success("Konseling berhasil dibatalkan");
        triggerNotificationRefresh();
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
            toast.error("Gagal membatalkan konseling");
          }
        }
      }
    }
  };

  // Calculate tab counts
  const tabCounts = {
    pending: consultations.filter((c) => c.status === "PENDING").length,
    active: consultations.filter((c) => c.status === "ACCEPTED").length,
    completed: consultations.filter((c) => c.status === "COMPLETED").length,
    declined: consultations.filter((c) => c.status === "DECLINED").length,
  };

  return (
    <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 flex flex-col overflow-hidden">
      <PageHeader
        title="Kelola Data Konseling"
        description="Kelola dan pantau sesi konseling dengan murid."
      />

      {/* Filters Component */}
      <ConsultationFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        counts={tabCounts}
      />

      <DataTableContainer loading={loading}>
        <div className="flex flex-col overflow-hidden">
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block overflow-hidden">
            {filteredConsultations.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  {searchTerm
                    ? "Tidak ada data yang sesuai dengan pencarian"
                    : "Belum ada data konseling"}
                </div>
              </div>
            ) : (
              <ConsultationTable
                consultations={filteredConsultations}
                onViewDetails={handleViewDetail}
                onAccept={(id: string) => handleUpdateStatus(id, "ACCEPTED")}
                onDecline={(consultation: Consultation) => {
                  setSelectedConsultation(consultation);
                  handleUpdateStatus(consultation.consultation_id, "DECLINED");
                }}
                onReschedule={handleReschedule}
                onCancel={handleCancelConsultation}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
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
              <ConsultationCards
                consultations={filteredConsultations}
                onViewDetails={handleViewDetail}
                onAccept={(id: string) => handleUpdateStatus(id, "ACCEPTED")}
                onDecline={(consultation: Consultation) => {
                  setSelectedConsultation(consultation);
                  handleUpdateStatus(consultation.consultation_id, "DECLINED");
                }}
                onReschedule={handleReschedule}
                onCancel={handleCancelConsultation}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
          </div>
        </div>
      </DataTableContainer>

      {/* Detail Modal Component */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        consultation={selectedConsultation}
        onClose={handleCloseDetailModal}
        onReschedule={handleReschedule}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Reschedule Modal Component */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        consultation={selectedConsultation}
        onClose={handleCloseRescheduleModal}
        onSubmit={handleSubmitReschedule}
        timeSlots={timeSlots}
      />
    </div>
  );
};

export default KelolaDataKonseling;
