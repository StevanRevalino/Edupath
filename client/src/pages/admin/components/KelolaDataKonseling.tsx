import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";

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
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch consultations from API
  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

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
            { status: newStatus, notes: result.value },
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
                    notes: result.value,
                    is_active: false, // Set is_active to false when declined
                  }
                : consultation
            )
          );

          toast.success("Konseling berhasil ditolak");
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

  const handleEndConsultation = async (consultationId: string) => {
    try {
      const result = await Swal.fire({
        title: "Akhiri Konseling?",
        text: "Apakah Anda yakin ingin mengakhiri konseling ini?",
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
        showCancelButton: true,
        confirmButtonColor: "#6CCBFF",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, akhiri konseling",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const token = TokenManager.getToken();

        await axios.patch(
          `${API_URL}/api/consultations/${consultationId}/end`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Update local state
        setConsultations(
          consultations.map((consultation) =>
            consultation.consultation_id === consultationId
              ? {
                  ...consultation,
                  status: "COMPLETED" as Consultation["status"],
                  is_active: false,
                }
              : consultation
          )
        );

        toast.success("Konseling berhasil diakhiri");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error(
            error.response?.data?.message || "Gagal mengakhiri konseling"
          );
        }
      } else {
        console.error("Error ending consultation:", error);
        toast.error("Gagal mengakhiri konseling");
      }
    }
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
                                  Alasan Penolakan:
                                </div>
                                <div className="text-xs text-red-600 text-wrap overflow-hidden text-ellipsis">
                                  {consultation.notes}
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
                          ).toLocaleDateString("id-ID")}
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
                        {consultation.status === "ACCEPTED" &&
                          consultation.is_active && (
                            <button
                              onClick={() =>
                                handleEndConsultation(
                                  consultation.consultation_id
                                )
                              }
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>End Consultation</span>
                            </button>
                          )}
                        {consultation.status === "ACCEPTED" &&
                          !consultation.is_active && (
                            <span className="text-sm text-gray-500">
                              Selesai
                            </span>
                          )}
                        {(consultation.status === "DECLINED" ||
                          consultation.status === "COMPLETED") && (
                          <span className="text-sm text-gray-500">
                            {consultation.status === "DECLINED" && "Ditolak"}
                            {consultation.status === "COMPLETED" && "Selesai"}
                          </span>
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
                        {consultation.status === "ACCEPTED" &&
                          consultation.is_active && (
                            <button
                              onClick={() =>
                                handleEndConsultation(
                                  consultation.consultation_id
                                )
                              }
                              className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors whitespace-nowrap"
                            >
                              <span className="w-2 h-2 bg-white rounded-full"></span>
                              <span>End</span>
                            </button>
                          )}
                        {consultation.status === "ACCEPTED" &&
                          !consultation.is_active && (
                            <span className="text-xs text-gray-500 text-center">
                              Selesai
                            </span>
                          )}
                        {(consultation.status === "DECLINED" ||
                          consultation.status === "COMPLETED") && (
                          <span className="text-xs text-gray-500 text-center">
                            {consultation.status === "DECLINED" && "Ditolak"}
                            {consultation.status === "COMPLETED" && "Selesai"}
                          </span>
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
                                Alasan Penolakan:
                              </div>
                              <div className="text-xs text-red-600">
                                {consultation.notes}
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
                        ).toLocaleDateString("id-ID")}
                      </div>

                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusColor(
                          consultation.status
                        )}`}
                      >
                        <span className="w-2 h-2 bg-current rounded-full opacity-60"></span>
                        <span>{getStatusText(consultation.status)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DataTableContainer>
    </div>
  );
};

export default KelolaDataKonseling;
