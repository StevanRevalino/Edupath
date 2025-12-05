import { X, Trash2 } from "lucide-react";

interface Student {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas: number | null;
  created_at: string;
}

interface EditStudentModalProps {
  isOpen: boolean;
  selectedStudent: Student | null;
  editForm: {
    firstname: string;
    lastname: string;
    kelas: number | null;
  };
  onClose: () => void;
  onInputChange: (field: string, value: string | number | null) => void;
  onUpdate: () => void;
  onDelete: () => void;
}

const EditStudentModal = ({
  isOpen,
  selectedStudent,
  editForm,
  onClose,
  onInputChange,
  onUpdate,
  onDelete,
}: EditStudentModalProps) => {
  if (!isOpen || !selectedStudent) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Data Murid</h3>
          <button
            onClick={onClose}
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
              onChange={(e) => onInputChange("firstname", e.target.value)}
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
              onChange={(e) => onInputChange("lastname", e.target.value)}
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
                onInputChange(
                  "kelas",
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0"
            >
              <option value="" disabled>
                Pilih Kelas
              </option>
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-4 border-t gap-3">
          <button
            onClick={onDelete}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors order-2 sm:order-1 cursor-pointer"
          >
            <Trash2 size={16} />
            <span>Hapus</span>
          </button>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 order-1 sm:order-2">
            <button
              onClick={onUpdate}
              disabled={
                !editForm.firstname || !editForm.lastname || !editForm.kelas
              }
              className={`px-4 py-2 rounded-lg transition-colors ${
                !editForm.firstname || !editForm.lastname || !editForm.kelas
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  : "bg-primary text-white hover:bg-primary-hover cursor-pointer"
              }`}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
