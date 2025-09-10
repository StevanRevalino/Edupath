import { useState, useEffect } from "react";

interface Consultation {
  id: string;
  studentName: string;
  studentKelas: string;
  topik: string;
  status: "pending" | "ongoing" | "completed" | "cancelled";
  tanggalKonseling: string;
  waktu: string;
  catatan?: string;
}

const KelolaDataKonseling = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - nanti bisa diganti dengan API call
  useEffect(() => {
    setTimeout(() => {
      const mockConsultations: Consultation[] = [
        {
          id: "1",
          studentName: "Ahmad Rizki",
          studentKelas: "XII IPA 1",
          topik: "Pemilihan Jurusan Kuliah",
          status: "pending",
          tanggalKonseling: "2024-03-15",
          waktu: "10:00",
          catatan: "Ingin konsultasi tentang jurusan teknik",
        },
        {
          id: "2",
          studentName: "Siti Nurhaliza",
          studentKelas: "XII IPS 2",
          topik: "Persiapan UTBK",
          status: "ongoing",
          tanggalKonseling: "2024-03-14",
          waktu: "14:00",
          catatan: "Butuh strategi belajar untuk UTBK",
        },
        {
          id: "3",
          studentName: "Budi Santoso",
          studentKelas: "XI IPA 1",
          topik: "Masalah Akademik",
          status: "completed",
          tanggalKonseling: "2024-03-10",
          waktu: "09:00",
          catatan: "Kesulitan di mata pelajaran Fisika",
        },
        {
          id: "4",
          studentName: "Dewi Sartika",
          studentKelas: "XI IPS 1",
          topik: "Karir dan Masa Depan",
          status: "pending",
          tanggalKonseling: "2024-03-16",
          waktu: "13:00",
          catatan: "Bingung memilih antara kuliah atau bekerja",
        },
        {
          id: "5",
          studentName: "Rudi Hartono",
          studentKelas: "X IPA 2",
          topik: "Motivasi Belajar",
          status: "cancelled",
          tanggalKonseling: "2024-03-12",
          waktu: "15:00",
          catatan: "Merasa tidak termotivasi untuk belajar",
        },
      ];
      setConsultations(mockConsultations);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "ongoing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "ongoing":
        return "Berlangsung";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.studentName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consultation.topik.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || consultation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (consultationId: string, newStatus: string) => {
    setConsultations(
      consultations.map((consultation) =>
        consultation.id === consultationId
          ? { ...consultation, status: newStatus as Consultation["status"] }
          : consultation
      )
    );
  };

  const handleDelete = (consultationId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data konseling ini?")) {
      setConsultations(
        consultations.filter(
          (consultation) => consultation.id !== consultationId
        )
      );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kelola Data Konseling</h1>
        <p className="text-gray-600">
          Kelola dan pantau sesi konseling dengan murid.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Konseling</p>
              <p className="text-2xl font-bold">{consultations.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">📊</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">
                {consultations.filter((c) => c.status === "pending").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">⏳</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Berlangsung</p>
              <p className="text-2xl font-bold text-blue-600">
                {consultations.filter((c) => c.status === "ongoing").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">🔄</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selesai</p>
              <p className="text-2xl font-bold text-green-600">
                {consultations.filter((c) => c.status === "completed").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Konseling
            </label>
            <input
              type="text"
              placeholder="Cari berdasarkan nama murid atau topik..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <div className="md:w-32 flex items-end">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              + Jadwal Baru
            </button>
          </div>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Data Konseling ({filteredConsultations.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Murid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data konseling"}
                    </td>
                  </tr>
                ) : (
                  filteredConsultations.map((consultation) => (
                    <tr key={consultation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {consultation.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {consultation.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {consultation.studentKelas}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {consultation.topik}
                        </div>
                        {consultation.catatan && (
                          <div className="text-sm text-gray-500 mt-1">
                            {consultation.catatan}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {new Date(
                            consultation.tanggalKonseling
                          ).toLocaleDateString("id-ID")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {consultation.waktu}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            consultation.status
                          )}`}
                        >
                          {getStatusText(consultation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <select
                            value={consultation.status}
                            onChange={(e) =>
                              handleUpdateStatus(
                                consultation.id,
                                e.target.value
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Menunggu</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                          <button
                            onClick={() => handleDelete(consultation.id)}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaDataKonseling;
