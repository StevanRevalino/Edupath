import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { PencilIcon, TrashIcon } from "lucide-react";

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
  const API_URL = import.meta.env.VITE_API_URL;

  // Dummy data for testing scroll
  const dummyStudents: Student[] = [
    {
      user_id: "1",
      firstname: "Ahmad",
      lastname: "Rizki",
      email: "ahmad.rizki@email.com",
      role: "student",
      kelas: "X",
      created_at: "2024-01-15T08:00:00Z",
    },
    {
      user_id: "2",
      firstname: "Siti",
      lastname: "Nurhaliza",
      email: "siti.nurhaliza@email.com",
      role: "student",
      kelas: "XI",
      created_at: "2024-01-16T09:30:00Z",
    },
    {
      user_id: "3",
      firstname: "Budi",
      lastname: "Santoso",
      email: "budi.santoso@email.com",
      role: "student",
      kelas: "XII",
      created_at: "2024-01-17T10:15:00Z",
    },
    {
      user_id: "4",
      firstname: "Dewi",
      lastname: "Sartika",
      email: "dewi.sartika@email.com",
      role: "student",
      kelas: "X",
      created_at: "2024-01-18T11:45:00Z",
    },
    {
      user_id: "5",
      firstname: "Raka",
      lastname: "Pratama",
      email: "raka.pratama@email.com",
      role: "student",
      kelas: "XI",
      created_at: "2024-01-19T13:20:00Z",
    },
    {
      user_id: "6",
      firstname: "Indira",
      lastname: "Maharani",
      email: "indira.maharani@email.com",
      role: "student",
      kelas: "XII",
      created_at: "2024-01-20T14:10:00Z",
    },
    {
      user_id: "7",
      firstname: "Fajar",
      lastname: "Nugroho",
      email: "fajar.nugroho@email.com",
      role: "student",
      kelas: "X",
      created_at: "2024-01-21T15:30:00Z",
    },
    {
      user_id: "8",
      firstname: "Maya",
      lastname: "Putri",
      email: "maya.putri@email.com",
      role: "student",
      kelas: "XI",
      created_at: "2024-01-22T16:45:00Z",
    },
    {
      user_id: "9",
      firstname: "Andi",
      lastname: "Firmansyah",
      email: "andi.firmansyah@email.com",
      role: "student",
      kelas: "XII",
      created_at: "2024-01-23T08:15:00Z",
    },
    {
      user_id: "10",
      firstname: "Lestari",
      lastname: "Wulandari",
      email: "lestari.wulandari@email.com",
      role: "student",
      kelas: "X",
      created_at: "2024-01-24T09:00:00Z",
    },
    {
      user_id: "11",
      firstname: "Yoga",
      lastname: "Permana",
      email: "yoga.permana@email.com",
      role: "student",
      kelas: "XI",
      created_at: "2024-01-25T10:30:00Z",
    },
    {
      user_id: "12",
      firstname: "Citra",
      lastname: "Kencana",
      email: "citra.kencana@email.com",
      role: "student",
      kelas: "XII",
      created_at: "2024-01-26T11:15:00Z",
    },
    {
      user_id: "13",
      firstname: "Dimas",
      lastname: "Ardiansyah",
      email: "dimas.ardiansyah@email.com",
      role: "student",
      kelas: "X",
      created_at: "2024-01-27T12:45:00Z",
    },
    {
      user_id: "14",
      firstname: "Putri",
      lastname: "Anggraini",
      email: "putri.anggraini@email.com",
      role: "student",
      kelas: "XI",
      created_at: "2024-01-28T13:20:00Z",
    },
    {
      user_id: "15",
      firstname: "Bayu",
      lastname: "Setiawan",
      email: "bayu.setiawan@email.com",
      role: "student",
      kelas: "XII",
      created_at: "2024-01-29T14:00:00Z",
    },
  ];

  // Load dummy data instead of API call
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setStudents(dummyStudents);
        setLoading(false);
      }, 1000);
    };

    loadData();
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
    // Implementasi edit functionality
  };

  const handleDelete = async (studentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Token tidak ditemukan. Silakan login ulang.");
          return;
        }

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
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast.error("Session expired. Silakan login ulang.");
        } else {
          toast.error("Gagal menghapus data murid");
        }
      }
    }
  };

  const kelasOptions = ["X", "XI", "XII"];

  return (
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter Kelas
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    {searchTerm || selectedKelas !== "all"
                      ? "Tidak ada data yang sesuai dengan filter"
                      : "Belum ada data murid"}
                  </div>
                </div>
              ) : (
                <div className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.user_id}
                      className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 items-center"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                          className="w-5 h-5 text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                          onClick={() => handleEdit(student.user_id)}
                        />
                        <TrashIcon
                          className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                          onClick={() => handleDelete(student.user_id)}
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
  );
};

export default KelolaDataMurid;
