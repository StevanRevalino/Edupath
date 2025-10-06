import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import StatisticsCards from "../../../components/StatisticsCards";
import SearchFilterBar from "../../../components/SearchFilterBar";
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
  const [statusFilter, setStatusFilter] = useState("all");
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

  const getKelasText = (kelas: number | null) => {
    if (!kelas) return "Belum diatur";
    const kelasMap: { [key: number]: string } = {
      10: "X",
      11: "XI",
      12: "XII",
    };
    return kelasMap[kelas] || `Kelas ${kelas}`;
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const fullName =
      `${consultation.murid.firstname} ${consultation.murid.lastname}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || consultation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    consultationId: string,
    newStatus: string
  ) => {
    try {
      Swal.fire({
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
      }).then(async (result) => {
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
      });
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

      <StatisticsCards
        statistics={[
          { label: "Total", value: consultations.length },
          {
            label: "Pending",
            value: consultations.filter((c) => c.status === "PENDING").length,
            color: "yellow",
          },
          {
            label: "Active",
            value: consultations.filter((c) => c.status === "ACCEPTED").length,
            color: "green",
          },
          {
            label: "History",
            value: consultations.filter(
              (c) => c.status === "COMPLETED" || c.status === "DECLINED"
            ).length,
            color: "blue",
          },
        ]}
      />

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Cari nama murid atau topik..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "all", label: "Semua Status" },
          { value: "PENDING", label: "Pending" },
          { value: "ACCEPTED", label: "Active" },
          { value: "COMPLETED", label: "Completed" },
          { value: "DECLINED", label: "Declined" },
        ]}
      />

      <DataTableContainer
        title="Data Konseling"
        count={filteredConsultations.length}
        loading={loading}
      >
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
                    {searchTerm || statusFilter !== "all"
                      ? "Tidak ada data yang sesuai dengan filter"
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
                            {getKelasText(consultation.murid.kelas)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-900 tex-wrap overflow-hidden text-ellipsis">
                          {consultation.topic}
                        </div>
                        {consultation.notes && (
                          <div
                            className="text-sm text-gray-500 mt-1 max-w-[200px] text-wrap overflow-hidden text-ellipsis"
                            title={consultation.notes}
                          >
                            {consultation.notes}
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
                        {consultation.status === "ACCEPTED" && (
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
                  {searchTerm || statusFilter !== "all"
                    ? "Tidak ada data yang sesuai dengan filter"
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
                            {getKelasText(consultation.murid.kelas)}
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
                        <div className="text-sm text-gray-500">
                          Catatan: {consultation.notes}
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
