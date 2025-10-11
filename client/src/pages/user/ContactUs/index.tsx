import { useState } from "react";
import ProfilePageLayout from "../Profil/components/ProfilePageLayout";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { Mail, Send, User, MessageSquare } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    namaDepan: "",
    namaBelakang: "",
    email: "",
    pesan: "",
  });

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

    // Compose email using mailto
    const subject = "Pesan dari Contact Form EduPath";
    const body = `Nama: ${formData.namaDepan} ${formData.namaBelakang}\nEmail: ${formData.email}\n\nPesan:\n${formData.pesan}`;
    const mailtoLink = `mailto:edupath.app@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  };

  const handleWhatsAppClick = () => {
    // WhatsApp link format: https://wa.me/phonenumber
    const phoneNumber = "6281296901533"; // format internasional tanpa +
    const message = "Halo EduPath! Saya ingin bertanya mengenai...";
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");
  };

  const handleInstagramClick = () => {
    // Instagram profile link
    const instagramLink = "https://www.instagram.com/edupath/";
    window.open(instagramLink, "_blank");
  };

  return (
    <ProfilePageLayout pageTitle="Hubungi Edupath">
      <div className="space-y-12 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00437A] to-[#0066B3] mb-3 pb-2">
            Hubungi Kami!
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Kami peduli dengan kritik dan saran yang Anda sampaikan demi
            kebaikan dan perkembangan EduPath sebagai platform yang optimal
            untuk membantu para pelajar menemukan minat dan bakat. Ada keperluan
            dengan EduPath? Ingin bertanya? Pastikan kesan dan pesan Anda
            didengar oleh kami dengan menghubungi tim EduPath melalui
            kontak-kontak berikut:
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* WhatsApp Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Gradient Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-t-2xl"></div>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/30 to-transparent rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/20 to-transparent rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <FaWhatsapp className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                WhatsApp
              </h2>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full mb-4">
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  +62 812 9690 1533
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6 px-4">
                Ingin berbicara langsung dengan tim EduPath? Kita bersedia
                melayani melalui percakapan WhatsApp!
              </p>
              <button
                onClick={handleWhatsAppClick}
                className="group relative bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0E7A6E] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat dengan kami!
                </span>
              </button>
            </div>
          </div>

          {/* Instagram Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Gradient Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E1306C] via-[#F77737] to-[#FCAF45] rounded-t-2xl"></div>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-transparent rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#E1306C] via-[#F77737] to-[#FCAF45] rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <FaInstagram className="w-12 h-12 text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                Instagram
              </h2>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 rounded-full mb-4">
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  @Edupath
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-6 px-4">
                Kunjungi media sosial EduPath untuk melihat perbaikan-perbaikan
                kami!
              </p>
              <button
                onClick={handleInstagramClick}
                className="group relative bg-gradient-to-r from-[#E1306C] via-[#F77737] to-[#FCAF45] hover:from-[#D12962] hover:to-[#F5A33C] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2">
                  <FaInstagram className="w-5 h-5" />
                  Kunjungi media sosial!
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Email Form Section */}
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
                <p className="font-semibold text-[#00437A]">
                  edupath.app@gmail.com
                </p>
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

        {/* Info Card */}
        <div className="bg-gradient-to-r from-[#00437A] to-[#0066B3] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <p className="text-base sm:text-lg font-semibold text-white text-center">
            💡 Tim kami akan merespons pesan Anda dalam waktu 1x24 jam di hari
            kerja
          </p>
        </div>
      </div>
    </ProfilePageLayout>
  );
}
