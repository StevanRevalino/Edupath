import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { X, Trash2 } from "lucide-react";
import TokenManager from "../../../utils/tokenManager";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import warningIcon from "../../../assets/warning-logo.png";
import PageHeader from "../../../components/PageHeader";
import SearchFilterBar from "../../../components/SearchFilterBar";
import DataTableContainer from "../../../components/DataTableContainer";

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

      // Convert kelas string to number for backend
      const kelasMap: { [key: string]: number } = {
        X: 10,
        XI: 11,
        XII: 12,
      };

      Swal.fire({
        title: "Apakah anda ingin menyimpan perubahan?",
        showDenyButton: true,
        confirmButtonText: "Simpan",
        denyButtonText: `Jangan Simpan`,
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const updatePayload = {
            firstname: editForm.firstname,
            lastname: editForm.lastname,
            kelas:
              editForm.kelas && kelasMap[editForm.kelas] !== undefined
                ? kelasMap[editForm.kelas]
                : null,
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
      confirmButtonColor: "#3085d6",
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

  const kelasOptions = ["X", "XI", "XII"];

  const getKelasColor = (kelas: string | null) => {
    switch (kelas) {
      case "X":
        return "bg-green-100 text-green-800";
      case "XI":
        return "bg-blue-100 text-blue-800";
      case "XII":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-64px)] p-6 flex flex-col overflow-hidden">
        <PageHeader
          title="Kelola Data Murid"
          description="Kelola data murid yang sudah terdaftar di EduPath."
          className="mb-6"
        />

        <SearchFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Cari berdasarkan nama atau email..."
          filterValue={selectedKelas}
          onFilterChange={setSelectedKelas}
          filterLabel="Filter Kelas"
          filterWidth="lg:w-48"
          filterOptions={[
            { value: "all", label: "Semua Kelas" },
            ...kelasOptions.map((kelas) => ({
              value: kelas,
              label: `Kelas ${kelas}`,
            })),
          ]}
          className="mb-4 sm:mb-6"
        />

        <DataTableContainer
          title="Data Murid"
          count={filteredStudents.length}
          loading={loading}
        >
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
                        {student.kelas
                          ? `Kelas ${student.kelas}`
                          : "Belum diatur"}
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
