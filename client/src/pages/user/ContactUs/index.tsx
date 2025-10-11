import { useState } from "react";
import ProfilePageLayout from "../Profil/components/ProfilePageLayout";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

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
      <div className="space-y-8 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Hubungi Kami!
          </h1>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-justify">
            Kami peduli dengan kritik dan saran yang Anda sampaikan demi
            kebaikan dan perkembangan EduPath sebagai platform yang optimal
            untuk membantu para pelajar menemukan minat dan bakat. Ada keperluan
            dengan EduPath? Ingin bertanya? Pastikan kesan dan pesan Anda
            didengar oleh kami dengan menghubungi tim EduPath melalui
            kontak-kontak berikut:
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* WhatsApp Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg shadow-gray-400 p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 shadow-md">
              <FaWhatsapp className="w-12 h-12 sm:w-16 sm:h-16 text-[#00437A]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              WhatsApp
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              +62 812 9690 1533
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 px-4">
              Ingin berbicara langsung dengan tim EduPath? Kita bersedia
              melayani melalui percakapan WhatsApp!
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="bg-[#4FC3F7] hover:bg-[#39B5E8] text-white font-medium px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base"
            >
              Chat dengan kami!
            </button>
          </div>

          {/* Lorem/Social Media Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg shadow-gray-400 p-6 sm:p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
              <FaInstagram className="w-12 h-12 sm:w-16 sm:h-16 text-[#00437A]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Instagram
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-1">@Edupath</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 px-4">
              Kunjungi media sosial EduPath untuk melihat perbatuan-perbaikan
              kami!
            </p>
            <button
              onClick={handleInstagramClick}
              className="bg-[#4FC3F7] hover:bg-[#39B5E8] text-white font-medium px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base"
            >
              Kunjungi media sosial!
            </button>
          </div>
        </div>

        {/* Email Form */}
        <div className="rounded-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Kirim Email
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-sm sm:text-base sm:min-w-[140px] text-gray-700">
                  Nama depan :
                </label>
                <input
                  type="text"
                  name="namaDepan"
                  value={formData.namaDepan}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-[#E0F4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="text-sm sm:text-base sm:min-w-[140px] text-gray-700">
                  Nama Belakang :
                </label>
                <input
                  type="text"
                  name="namaBelakang"
                  value={formData.namaBelakang}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 bg-[#E0F4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-sm sm:text-base sm:min-w-[140px] text-gray-700">
                Email :
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 bg-[#E0F4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Tujuan Field - Read Only */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <label className="text-sm sm:text-base sm:min-w-[140px] text-gray-700">
                Tujuan :
              </label>
              <div className="flex-1 py-2 rounded-lg text-gray-600 font-semibold text-sm sm:text-base">
                edupath.app@gmail.com
              </div>
            </div>

            {/* Message Field */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <label className="text-sm sm:text-base sm:min-w-[140px] text-gray-700 sm:pt-2">
                Pesan :
              </label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleInputChange}
                rows={6}
                className="flex-1 px-4 py-2 bg-[#E0F4FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-[#4FC3F7] hover:bg-[#39B5E8] text-white font-medium px-8 sm:px-10 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                Kirim Pesan
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProfilePageLayout>
  );
}
