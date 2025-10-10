import ProfilePageLayout from "../Profil/components/ProfilePageLayout";

export default function ContactUs() {
  return (
    <ProfilePageLayout pageTitle="Hubungi Edupath">
      <div className="space-y-5 p-10 pb-5">
        {/* Header */}
        <h1 className="text-4xl font-bold text-[#00437A] mb-8">Hubungi Kami</h1>

        {/* Contact Information */}
        <div className="grid gap-5 pl-5">
          {/* Left Column - Contact Details */}
          <div className="space-y-6">
            {/* Contact Item 1 */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-[#00437A] mb-1">
                Stevan Revalino
              </h3>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Email</span>
                <span>: stevanrevalino08@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Nomor</span>
                <span>: 081296901533</span>
              </div>
            </div>

            {/* Contact Item 2 */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-[#00437A] mb-1">
                Valentinus Rafael Gani
              </h3>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Email</span>
                <span>: rafaelgani17@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Nomor</span>
                <span>: 08155133300</span>
              </div>
            </div>

            {/* Contact Item 3 */}
            <div className="mb-10">
              <h3 className="text-lg font-bold text-[#00437A] mb-1">
                Dimitri Darmawan
              </h3>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Email</span>
                <span>: darmaz.smpdb@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[100px]">Nomor</span>
                <span>: 085880479921</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfilePageLayout>
  );
}
