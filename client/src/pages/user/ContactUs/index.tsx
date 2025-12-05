import ProfilePageLayout from "../Profil/components/ProfilePageLayout";
import ContactCard from "./components/ContactCard";
import ContactForm from "./components/ContactForm";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { MessageSquare } from "lucide-react";

export default function ContactUs() {
  const handleWhatsAppClick = () => {
    const phoneNumber = "6281296901533";
    const message = "Halo EduPath! Saya ingin bertanya mengenai...";
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");
  };

  const handleInstagramClick = () => {
    const instagramLink =
      "https://www.instagram.com/edupath_app?igsh=a3ZzcHBhN3Brbnhy&utm_source=qr";
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
          <ContactCard
            title="WhatsApp"
            contact="+62 812 9690 1533"
            description="Ingin berbicara langsung dengan tim EduPath? Kita bersedia melayani melalui percakapan WhatsApp!"
            icon={<FaWhatsapp className="w-12 h-12 text-white" />}
            gradientFrom="#25D366"
            gradientTo="#128C7E"
            accentGradient="from-[#25D366] to-[#128C7E]"
            badgeGradient="from-green-50 to-emerald-50"
            badgeBorder="border-green-200"
            decorativeGradient="from-green-100/30"
            buttonText="Chat dengan kami!"
            buttonIcon={<MessageSquare className="w-5 h-5" />}
            onButtonClick={handleWhatsAppClick}
          />

          {/* Instagram Card */}
          <ContactCard
            title="Instagram"
            contact="@Edupath"
            description="Kunjungi media sosial EduPath untuk melihat perbaikan-perbaikan kami!"
            icon={<FaInstagram className="w-12 h-12 text-white" />}
            gradientFrom="#E1306C"
            gradientVia="#F77737"
            gradientTo="#FCAF45"
            accentGradient="from-[#E1306C] via-[#F77737] to-[#FCAF45]"
            badgeGradient="from-pink-50 to-orange-50"
            badgeBorder="border-pink-200"
            decorativeGradient="from-pink-100/30"
            buttonText="Kunjungi media sosial!"
            buttonIcon={<FaInstagram className="w-5 h-5" />}
            onButtonClick={handleInstagramClick}
          />
        </div>

        {/* Email Form Section */}
        <ContactForm />

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
