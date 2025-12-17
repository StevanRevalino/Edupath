import { useState, useEffect } from "react";
import { Mail, Send, User, MessageSquare } from "lucide-react";
import axios from "axios";
import TokenManager from "../../../../utils/tokenManager";

interface ContactFormData {
  namaDepan: string;
  namaBelakang: string;
  email: string;
  pesan: string;
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
  destinationEmail?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ContactForm({
  onSubmit,
  destinationEmail = "edupath.app@gmail.com",
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    namaDepan: "",
    namaBelakang: "",
    email: "",
    pesan: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = TokenManager.getToken();
      const userData = TokenManager.getUserData();

      if (!token || !userData.userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/users/${userData.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        setFormData((prev) => ({
          ...prev,
          namaDepan: user.firstname || "",
          namaBelakang: user.lastname || "",
          email: user.email || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(formData);
    } else {
      // Default behavior: compose email using mailto
      const subject = "Pesan dari Contact Form EduPath";
      const body = `Nama: ${formData.namaDepan} ${formData.namaBelakang}\nEmail: ${formData.email}\n\nPesan:\n${formData.pesan}`;
      const mailtoLink = `mailto:${destinationEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoLink;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200/50 backdrop-blur-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00437A]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200/50 backdrop-blur-sm">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#00437A]/5 to-transparent rounded-full blur-3xl -z-10"></div>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-[#00437A] to-[#0066B3] rounded-xl shadow-md">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00437A] to-[#0066B3]">
          Kirim Email
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#00437A]" />
              Nama Depan
            </label>
            <input
              type="text"
              name="namaDepan"
              value={formData.namaDepan}
              onChange={handleInputChange}
              placeholder="Masukkan nama depan"
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-[#00437A]" />
              Nama Belakang
            </label>
            <input
              type="text"
              name="namaBelakang"
              value={formData.namaBelakang}
              onChange={handleInputChange}
              placeholder="Masukkan nama belakang"
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#00437A]" />
            Email Anda
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="nama@email.com"
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Tujuan Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#00437A]" />
            Tujuan
          </label>
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
            <p className="font-semibold text-[#00437A]">{destinationEmail}</p>
          </div>
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#00437A]" />
            Pesan
          </label>
          <textarea
            name="pesan"
            value={formData.pesan}
            onChange={handleInputChange}
            rows={6}
            placeholder="Tulis pesan Anda di sini..."
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4FC3F7] focus:border-transparent transition-all resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="group relative bg-gradient-to-r from-[#4FC3F7] to-[#00B4D8] hover:from-[#39B5E8] hover:to-[#0096C7] text-white font-bold px-10 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Kirim Pesan
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
