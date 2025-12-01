import React, { useState, useEffect } from "react";
import { CircleAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import TokenManager from "../../../../utils/tokenManager";
import { useNavigate } from "react-router-dom";
import WarningLogo from "../../../../assets/warning-logo.png";
import QuestionLogo from "../../../../assets/question-logo.png";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface UpdateProfileData {
  firstname: string;
  lastname: string;
  kelas: number;
}

interface ModalEditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentData: {
    firstname: string;
    lastname: string;
    kelas?: number;
  };
}

const ModalEditProfile: React.FC<ModalEditProfileProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentData,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: currentData.firstname,
    lastname: currentData.lastname,
    kelas:
      typeof currentData.kelas === "number"
        ? currentData.kelas
        : Number(currentData.kelas) || 10,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstname: currentData.firstname,
        lastname: currentData.lastname,
        kelas:
          typeof currentData.kelas === "number"
            ? currentData.kelas
            : Number(currentData.kelas) || 10,
      });
      setErrors({});
    }
  }, [isOpen, currentData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kelas" ? Number(value) || 10 : value,
    }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "Nama depan tidak boleh kosong";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Nama belakang tidak boleh kosong";
    }

    if (!formData.kelas) {
      newErrors.kelas = "Kelas harus diisi";
    } else if (formData.kelas < 10 || formData.kelas > 12) {
      newErrors.kelas = "Kelas harus antara 10-12";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon periksa input Anda");
      return;
    }

    Swal.fire({
      title: "Konfirmasi Perubahan Profil",
      text: "Apakah Anda yakin ingin mengubah profil?",
      imageUrl: QuestionLogo,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: "#6CCBFF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, simpan perubahan",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setSubmitting(true);
        try {
          const token = TokenManager.getToken();
          if (!token) {
            toast.error("Token tidak ditemukan");
            navigate("/login");
            return;
          }

          const updateData: UpdateProfileData = {
            firstname: formData.firstname,
            lastname: formData.lastname,
            kelas: formData.kelas,
          };

          await axios.put(`${API_URL}/api/auth/update-profile`, updateData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Trigger custom event to refresh Header
          window.dispatchEvent(new Event("profileUpdated"));

          toast.success("Profil berhasil diperbarui!");
          onSuccess();
          handleClose();
        } catch (error: any) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            toast.error("Token expired. Silakan login kembali.");
            TokenManager.logout();
            navigate("/login");
            return;
          }

          const errorMessage =
            error.response?.data?.message || "Gagal memperbarui profil";
          toast.error(errorMessage);
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const handleChangePassword = () => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Mengubah password akan mengeluarkan Anda dari aplikasi.",
      imageUrl: WarningLogo,
      imageWidth: 100,
      imageHeight: 120,
      imageAlt: "Warning",
      icon: undefined,
      showCancelButton: true,
      confirmButtonColor: "#6CCBFF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, ubah password",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        TokenManager.logout();
        toast.success("Silakan login kembali untuk mengubah password");
        navigate("/login");
        onClose();
      }
    });
  };

  const handleClose = () => {
    setFormData({
      firstname: currentData.firstname,
      lastname: currentData.lastname,
      kelas:
        typeof currentData.kelas === "number"
          ? currentData.kelas
          : Number(currentData.kelas) || 10,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={submitting}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Ubah Profil</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Firstname Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Depan
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstname ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan nama depan"
              disabled={submitting}
            />
            {errors.firstname && (
              <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>
            )}
          </div>

          {/* Lastname Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Belakang
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastname ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan nama belakang"
              disabled={submitting}
            />
            {errors.lastname && (
              <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>
            )}
          </div>

          {/* Kelas Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas <span className="text-red-500">*</span>
            </label>
            <select
              name="kelas"
              value={formData.kelas}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.kelas ? "border-red-500" : "border-gray-300"
              }`}
              disabled={submitting}
            >
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            {errors.kelas && (
              <p className="text-red-500 text-sm mt-1">{errors.kelas}</p>
            )}
          </div>

          {/* Change Password Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleChangePassword}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              disabled={submitting}
            >
              Ubah Password
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              <CircleAlert className="inline w-4 h-4 mr-1 text-yellow-500" />
              Mengubah password akan mengeluarkan Anda dari aplikasi.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-300 hover:bg-sky-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditProfile;
