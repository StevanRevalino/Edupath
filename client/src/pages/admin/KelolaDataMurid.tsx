import { useState, useEffect } from "react";

interface Student {
  id: string;
  nama: string;
  kelas: string;
  email: string;
  createdAt: string;
}

const KelolaDataMurid = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all");

  // Mock data - nanti bisa diganti dengan API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockStudents: Student[] = [
        {
          id: "1",
          nama: "Ahmad Rizki",
          kelas: "XII IPA 1",
          email: "ahmad.rizki@gmail.com",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          nama: "Siti Nurhaliza",
          kelas: "XII IPS 2",
          email: "siti.nurhaliza@gmail.com",
          createdAt: "2024-01-20",
        },
        {
          id: "3",
          nama: "Budi Santoso",
          kelas: "XI IPA 1",
          email: "budi.santoso@gmail.com",
          createdAt: "2024-02-10",
        },
        {
          id: "4",
          nama: "Dewi Sartika",
          kelas: "XI IPS 1",
          email: "dewi.sartika@gmail.com",
          createdAt: "2024-02-15",
        },
        {
          id: "5",
          nama: "Rudi Hartono",
          kelas: "X IPA 2",
          email: "rudi.hartono@gmail.com",
          createdAt: "2024-03-01",
        },
      ];
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKelas =
      selectedKelas === "all" || student.kelas === selectedKelas;
    return matchesSearch && matchesKelas;
  });

  const handleEdit = (studentId: string) => {
    console.log("Edit student:", studentId);
    // Implementasi edit functionality
  };

  const handleDelete = (studentId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data murid ini?")) {
      setStudents(students.filter((student) => student.id !== studentId));
    }
  };

  const kelasOptions = [
    "XII IPA 1",
    "XII IPA 2",
    "XII IPS 1",
    "XII IPS 2",
    "XI IPA 1",
    "XI IPA 2",
    "XI IPS 1",
    "XI IPS 2",
    "X IPA 1",
    "X IPA 2",
    "X IPS 1",
    "X IPS 2",
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Kelola Data Murid</h1>
        <p className="text-gray-600">
          Kelola data murid yang sudah terdaftar di EduPath.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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
                  {kelas}
                </option>
              ))}
            </select>
          </div>
          <div className="md:w-32 flex items-end">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              + Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            Data Murid ({filteredStudents.length})
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
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm || selectedKelas !== "all"
                        ? "Tidak ada data yang sesuai dengan filter"
                        : "Belum ada data murid"}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {student.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {student.nama}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(student.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
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

export default KelolaDataMurid;
