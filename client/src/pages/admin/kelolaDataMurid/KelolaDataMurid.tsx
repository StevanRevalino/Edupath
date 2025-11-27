import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import questionIcon from "../../../assets/question-logo.png";
import warningIcon from "../../../assets/warning-logo.png";
import PageHeader from "../../../components/PageHeader";
import DataTableContainer from "../../../components/DataTableContainer";
import AdminDataTable from "../components/AdminDataTable";
import EditStudentModal from "./components/EditStudentModal";
import { userManagementHandler } from "../../../handler/userManagementHandler";

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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userManagementHandler.getAllStudents();
        setStudents(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Gagal mengambil data murid");
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

  const handleEditFormChange = (
    field: string,
    value: string | number | null
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
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
      Swal.fire({
        title: "Apakah anda ingin menyimpan perubahan?",
        showDenyButton: true,
        confirmButtonText: "Simpan",
        denyButtonText: `Jangan Simpan`,
        confirmButtonColor: "var(--primary)",
        denyButtonColor: "#d33",
        imageUrl: questionIcon,
        imageWidth: 80,
        imageHeight: 90,
      }).then(async (result) => {
        if (result.isConfirmed) {
          const updatePayload = {
            firstname: editForm.firstname,
            lastname: editForm.lastname,
            kelas: editForm.kelas!,
          };

          await userManagementHandler.updateStudent(
            selectedStudent.user_id,
            updatePayload
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
      console.error("Error updating user:", error);
      toast.error("Gagal memperbarui data murid");
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
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userManagementHandler.deleteStudent(studentId);

          setStudents(
            students.filter((student) => student.user_id !== studentId)
          );
          toast.success("Data murid berhasil dihapus");

          // Tutup modal jika delete dipanggil dari modal
          if (isModalOpen) {
            handleCloseModal();
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Gagal menghapus data murid");
        }
      }
    });
  };

  const getKelasColor = (kelas: number | null) => {
    switch (kelas) {
      case 10:
        return "bg-green-100 text-green-800";
      case 11:
        return "bg-secondary-light text-primary-dark";
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
                    selectedKelas === "all" ? "text-black" : "text-gray-500"
                  }`}
                >
                  Semua Kelas
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === "all" ? "text-black" : "text-gray-400"
                  }`}
                >
                  {students.length}
                </span>
              </div>
              {selectedKelas === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black"></div>
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
                    selectedKelas === 11 ? "text-primary-dark" : "text-gray-500"
                  }`}
                >
                  Kelas 11
                </span>
                <span
                  className={`text-3xl font-bold transition-colors ${
                    selectedKelas === 11 ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {students.filter((s) => s.kelas === 11).length}
                </span>
              </div>
              {selectedKelas === 11 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
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
          <div className="hidden lg:block overflow-y-auto">
            <AdminDataTable
              columns={[
                {
                  header: "Nama",
                  accessor: (student) => (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {(student.firstname || "N/A").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">
                          {`${student.firstname || ""} ${
                            student.lastname || ""
                          }`.trim() || "N/A"}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Kelas",
                  accessor: (student) => (
                    <span
                      className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getKelasColor(
                        student.kelas
                      )}`}
                    >
                      {student.kelas || "-"}
                    </span>
                  ),
                },
                {
                  header: "Email",
                  accessor: (student) => (
                    <span className="text-sm text-gray-700">
                      {student.email || "N/A"}
                    </span>
                  ),
                },
                {
                  header: "Tanggal Daftar",
                  accessor: (student) =>
                    new Date(student.created_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                },
                {
                  header: "Aksi",
                  accessor: (student) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(student.user_id);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
                    >
                      Edit
                    </button>
                  ),
                },
              ]}
              data={filteredStudents}
              keyExtractor={(student) => student.user_id}
              onRowClick={(student) => handleEdit(student.user_id)}
              emptyMessage="Tidak ada data murid"
            />
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
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
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
                        className="flex items-center space-x-1 px-3 py-1 bg-primary text-white text-sm rounded-full hover:bg-primary-light transition-colors"
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
      <EditStudentModal
        isOpen={isModalOpen}
        selectedStudent={selectedStudent}
        editForm={editForm}
        onClose={handleCloseModal}
        onInputChange={handleEditFormChange}
        onUpdate={handleUpdateStudent}
        onDelete={() =>
          selectedStudent && handleDelete(selectedStudent.user_id)
        }
      />
    </>
  );
};

export default KelolaDataMurid;
