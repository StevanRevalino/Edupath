import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { PencilIcon, X, Trash2 } from "lucide-react";
import TokenManager from "../../utils/tokenManager";

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas: string | null;
  created_at: string;
}

const KelolaDataMurid = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    kelas: "",
  });
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        const response = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setStudents(response.data.data);
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
            toast.error("Gagal mengambil data murid");
          }
        } else {
          console.error("Error fetching users:", error);
          toast.error("Gagal mengambil data murid");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstname} ${student.lastname}`.trim();
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesKelas =
      selectedKelas === "all" || student.kelas === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  const handleEdit = (studentId: string) => {
    const student = students.find((s) => s.user_id === studentId);
    if (student) {
      setSelectedStudent(student);
      setEditForm({
        firstname: student.firstname || "",
        lastname: student.lastname || "",
        kelas: student.kelas || "",
      });
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setEditForm({
      firstname: "",
      lastname: "",
      kelas: "",
    });
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const token = TokenManager.getToken();

      await axios.put(
        `${API_URL}/api/users/${selectedStudent.user_id}`,
        {
          firstname: editForm.firstname,
          lastname: editForm.lastname,
          kelas: editForm.kelas || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update state lokal
      setStudents(
        students.map((student) =>
          student.user_id === selectedStudent.user_id
            ? { ...student, ...editForm }
            : student
        )
      );

      toast.success("Data murid berhasil diperbarui");
      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error("Gagal memperbarui data murid");
        }
      } else {
        console.error("Error updating user:", error);
        toast.error("Gagal memperbarui data murid");
      }
    }
  };

  const handleDelete = async (studentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
      try {
        const token = TokenManager.getToken();

        await axios.delete(`${API_URL}/api/users/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setStudents(
          students.filter((student) => student.user_id !== studentId)
        );
        toast.success("Data murid berhasil dihapus");

        // Tutup modal jika delete dipanggil dari modal
        if (isModalOpen) {
          handleCloseModal();
        }
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
            toast.error("Gagal menghapus data murid");
          }
        } else {
          console.error("Error deleting user:", error);
          toast.error("Gagal menghapus data murid");
        }
      }
    }
  };

  const kelasOptions = ["X", "XI", "XII"];

  return (
    <>
      <div className="max-h-[calc(100vh-64px)] p-6 flex flex-col overflow-hidden">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold mb-2">Kelola Data Murid</h1>
          <p className="text-gray-600">
            Kelola data murid yang sudah terdaftar di EduPath.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex-shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Murid
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparen outline-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Kelas
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
              >
                <option value="all">Semua Kelas</option>
                {kelasOptions.map((kelas) => (
                  <option key={kelas} value={kelas}>
                    Kelas {kelas}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden max-h-[calc(100vh-24rem)] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold">
              Data Murid ({filteredStudents.length})
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
            <div className=" flex flex-col overflow-hidden">
              {/* Header - Fixed */}
              <div className="bg-gray-50 grid grid-cols-5 gap-4 px-6 py-3 text-left text-md font-medium text-gray-500 uppercase tracking-wider flex-shrink-0 border-b border-gray-200">
                <div>Nama</div>
                <div>Kelas</div>
                <div>Email</div>
                <div>Tanggal Daftar</div>
                <div>Action</div>
              </div>

              {/* Data Rows - Scrollable */}
              <div className="overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      Tidak ada data.
                    </div>
                  </div>
                ) : (
                  <div className="bg-white">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.user_id}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 items-center"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-[#D0E5FF] rounded-full flex items-center justify-center">
                            <span className="text-[#003B73] font-semibold">
                              {(student.firstname || "N/A")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {`${student.firstname || ""} ${
                                student.lastname || ""
                              }`.trim() || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {student.kelas
                              ? `Kelas ${student.kelas}`
                              : "Belum diatur"}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          <span
                            className="truncate block max-w-[200px]"
                            title={student.email || "N/A"}
                          >
                            {student.email || "N/A"}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <PencilIcon
                            className="w-5 h-5 text-[#6CCBFF] cursor-pointer hover:text-[#6CCBFF]/80 transition-colors"
                            onClick={() => handleEdit(student.user_id)}
                          />
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

      {/* Modal Edit Student - Outside main container to avoid blur */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Data Murid</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Depan
                </label>
                <input
                  type="text"
                  value={editForm.firstname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstname: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
                  placeholder="Masukkan nama depan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Belakang
                </label>
                <input
                  type="text"
                  value={editForm.lastname}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastname: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
                  placeholder="Masukkan nama belakang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas
                </label>
                <select
                  value={editForm.kelas}
                  onChange={(e) =>
                    setEditForm({ ...editForm, kelas: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasOptions.map((kelas) => (
                    <option key={kelas} value={kelas}>
                      Kelas {kelas}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500">
                <strong>Email:</strong> {selectedStudent?.email}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                onClick={() =>
                  selectedStudent && handleDelete(selectedStudent.user_id)
                }
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateStudent}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KelolaDataMurid;
