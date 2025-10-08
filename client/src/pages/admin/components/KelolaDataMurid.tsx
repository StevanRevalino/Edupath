import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { X, Trash2 } from "lucide-react";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import warningIcon from "../../../assets/warning-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas: number | null;
  created_at: string;
}

const KelolaDataMurid = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState<"all" | 10 | 11 | 12>(
    "all"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editForm, setEditForm] = useState({
    firstname: "",
    lastname: "",
    kelas: null as number | null,
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
        kelas: student.kelas,
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
      kelas: null,
    });
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;

    // Validasi form
    if (!editForm.firstname.trim()) {
      toast.error("Nama depan harus diisi");
      return;
    }

    if (!editForm.lastname.trim()) {
      toast.error("Nama belakang harus diisi");
      return;
    }

    if (!editForm.kelas) {
      toast.error("Kelas harus dipilih");
      return;
    }

    try {
      const token = TokenManager.getToken();

      Swal.fire({
        title: "Apakah anda ingin menyimpan perubahan?",
        showDenyButton: true,
        confirmButtonText: "Simpan",
        denyButtonText: `Jangan Simpan`,
        confirmButtonColor: "#6CCBFF",
        denyButtonColor: "#d33",
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const updatePayload = {
            firstname: editForm.firstname,
            lastname: editForm.lastname,
            kelas: editForm.kelas,
          };

          await axios.put(
            `${API_URL}/api/users/${selectedStudent.user_id}`,
            updatePayload,
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
                ? {
                    ...student,
                    firstname: editForm.firstname,
                    lastname: editForm.lastname,
                    kelas: editForm.kelas,
                  }
                : student
            )
          );

          toast.success("Data murid berhasil diperbarui");
          handleCloseModal();
        } else if (result.isDenied) {
          toast.error("Perubahan tidak disimpan");
          handleCloseModal();
        }
      });
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
    Swal.fire({
      title: "Yakin ingin menghapus data murid ini?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      imageUrl: warningIcon,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: "#6CCBFF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
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
        toast.success("Data murid berhasil dihapus");
      }
    });
  };

  const getKelasColor = (kelas: number | null) => {
    switch (kelas) {
      case 10:
        return "bg-green-100 text-green-800";
      case 11:
        return "bg-blue-100 text-blue-800";
      case 12:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 flex flex-col overflow-hidden">
        <PageHeader
          title="Kelola Data Murid"
          description="Kelola data murid yang sudah terdaftar di EduPath."
        />

        {/* Integrated Control Panel: Kelas Tabs + Search */}
        <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
          {/* Kelas Tabs with Stats */}
          <div className="grid grid-cols-4">
            <button
              onClick={() => setSelectedKelas("all")}
              className={`px-4 py-5 transition-all duration-200 relative ${
                selectedKelas === "all"
                  ? "bg-gradient-to-b from-blue-50 to-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selectedKelas === "all" ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  Semua Kelas
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === "all" ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {students.length}
                </span>
              </div>
              {selectedKelas === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
              )}
            </button>

            <button
              onClick={() => setSelectedKelas(10)}
              className={`px-4 py-5 transition-all duration-200 relative ${
                selectedKelas === 10
                  ? "bg-gradient-to-b from-green-50 to-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selectedKelas === 10 ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  Kelas 10
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === 10 ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {students.filter((s) => s.kelas === 10).length}
                </span>
              </div>
              {selectedKelas === 10 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500"></div>
              )}
            </button>

            <button
              onClick={() => setSelectedKelas(11)}
              className={`px-4 py-5 transition-all duration-200 relative ${
                selectedKelas === 11
                  ? "bg-gradient-to-b from-blue-50 to-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selectedKelas === 11 ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  Kelas 11
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === 11 ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {students.filter((s) => s.kelas === 11).length}
                </span>
              </div>
              {selectedKelas === 11 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
              )}
            </button>

            <button
              onClick={() => setSelectedKelas(12)}
              className={`px-4 py-5 transition-all duration-200 relative ${
                selectedKelas === 12
                  ? "bg-gradient-to-b from-purple-50 to-white"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    selectedKelas === 12 ? "text-purple-700" : "text-gray-500"
                  }`}
                >
                  Kelas 12
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === 12 ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {students.filter((s) => s.kelas === 12).length}
                </span>
              </div>
              {selectedKelas === 12 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
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
                placeholder="Cari berdasarkan nama atau email..."
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
          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="bg-gray-50 grid grid-cols-5 gap-4 px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider flex-shrink-0 border-b border-gray-200">
              <div>Nama</div>
              <div>Kelas</div>
              <div>Email</div>
              <div>Tanggal Daftar</div>
              <div>Action</div>
            </div>

            {/* Data Rows - Scrollable */}
            <div className="overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="flex items-center justify-center h-32">
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
                        <div className="w-10 h-10 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#050051] font-bold">
                            {(student.firstname || "N/A")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-md font-semibold text-gray-900">
                            {`${student.firstname || ""} ${
                              student.lastname || ""
                            }`.trim() || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getKelasColor(
                            student.kelas
                          )}`}
                        >
                          {student.kelas}
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
                        <button
                          onClick={() => handleEdit(student.user_id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View - Hidden on Desktop */}
          <div className="lg:hidden overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">Tidak ada data.</div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.user_id}
                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-[#6CCBFF] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#050051] font-bold text-lg">
                            {(student.firstname || "N/A")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-lg font-semibold text-gray-900">
                            {`${student.firstname || ""} ${
                              student.lastname || ""
                            }`.trim() || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(student.created_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(student.user_id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium w-fit ${getKelasColor(
                          student.kelas
                        )}`}
                      >
                        {student.kelas}
                      </span>

                      <div className="text-sm text-gray-500 break-all">
                        {student.email || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DataTableContainer>
      </div>

      {/* Modal Edit Student - Responsive */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Data Murid</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Depan <span className="text-red-500">*</span>
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
                  Nama Belakang <span className="text-red-500">*</span>
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
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={editForm.kelas || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      kelas: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
                >
                  <option value="" disabled>Pilih Kelas</option>
                  <option value={10}>10</option>
                  <option value={11}>11</option>
                  <option value={12}>12</option>
                </select>
              </div>

              <div className="text-sm text-gray-500 break-words">
                <strong>Email:</strong> {selectedStudent?.email}
              </div>
            </div>

            {/* Responsive Button Layout */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t gap-3 ">
              <button
                onClick={() =>
                  selectedStudent && handleDelete(selectedStudent.user_id)
                }
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors order-2 sm:order-1 cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
                <button
                  onClick={handleUpdateStudent}
                  disabled={
                    !editForm.firstname || !editForm.lastname || !editForm.kelas
                  }
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !editForm.firstname || !editForm.lastname || !editForm.kelas
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                  }`}
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
