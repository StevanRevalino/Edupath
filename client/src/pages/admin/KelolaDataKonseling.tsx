import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../utils/tokenManager";

interface Consultation {
  consultation_id: string;
  murid_id: string;
  topic: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
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
        return "text-yellow-500";
      case "ACCEPTED":
        return "text-green-500";
      case "DECLINED":
        return "text-red-500";
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
            ? { ...consultation, status: newStatus as Consultation["status"] }
            : consultation
        )
      );

      toast.success("Status konseling berhasil diperbarui");
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

  return (
    <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 flex flex-col overflow-hidden">
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Kelola Data Konseling
        </h1>
        <p className="text-gray-600">
          Kelola dan pantau sesi konseling dengan murid.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">
        <div className="bg-white rounded-lg shadow p-2 sm:p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 font-bold">Total</p>
            <p className="text-lg font-bold">{consultations.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 font-bold">Pending</p>
            <p className="text-lg font-bold text-yellow-600">
              {consultations.filter((c) => c.status === "PENDING").length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 font-bold">Accepted</p>
            <p className="text-lg font-bold text-green-600">
              {consultations.filter((c) => c.status === "ACCEPTED").length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 font-bold">Declined</p>
            <p className="text-lg font-bold text-red-600">
              {consultations.filter((c) => c.status === "DECLINED").length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-3 sm:mb-4 flex-shrink-0">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama murid atau topik..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:w-40">
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DECLINED">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-20rem)] sm:max-h-[calc(100vh-24rem)] flex flex-col">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold">
            Data Konseling ({filteredConsultations.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          </div>
        ) : (
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
                          <div className="text-sm text-gray-900">
                            {consultation.topic}
                          </div>
                          {consultation.notes && (
                            <div
                              className="text-sm text-gray-500 mt-1 max-w-[200px] truncate"
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
                          {consultation.status !== "PENDING" && (
                            <span className="text-sm text-gray-500">
                              {consultation.status === "ACCEPTED" &&
                                "Sudah diterima"}
                              {consultation.status === "DECLINED" &&
                                "Sudah ditolak"}
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
                                className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
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
                                className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
                              >
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                          {consultation.status !== "PENDING" && (
                            <span className="text-xs text-gray-500 text-center">
                              {consultation.status === "ACCEPTED" &&
                                "Sudah diterima"}
                              {consultation.status === "DECLINED" &&
                                "Sudah ditolak"}
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
        )}
      </div>
    </div>
  );
};

export default KelolaDataKonseling;
