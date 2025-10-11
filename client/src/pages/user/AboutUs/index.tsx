import ProfilePageLayout from "../Profil/components/ProfilePageLayout";
import { Eye, Target, Users } from "lucide-react";
import logo from "../../../assets/edupath-logo.png";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Stevan Revalino",
      role: "Lead Back-end Developer",
      description:
        "Bertanggung jawab dalam pengembangan sistem backend, database management, API development, dan arsitektur sistem untuk memastikan platform EduPath berjalan dengan optimal dan aman.",
    },
    {
      name: "Valentinus Rafael Gani",
      role: "Lead Front-end Developer",
      description:
        "Memimpin pengembangan antarmuka pengguna yang intuitif dan responsif. Bertanggung jawab atas desain UI/UX, implementasi fitur frontend, dan memastikan pengalaman pengguna yang seamless di platform EduPath.",
    },
    {
      name: "Dimitri Darmawan",
      role: "UI/UX Designer",
      description:
        "Bertanggung jawab atas desain antarmuka dan pengalaman pengguna EduPath. Menciptakan desain yang intuitif, estetis, dan user-friendly untuk memastikan setiap interaksi pengguna dengan platform memberikan pengalaman yang optimal dan menyenangkan.",
    },
  ];

  return (
    <ProfilePageLayout pageTitle="Tentang Edupath">
      <div className="space-y-12 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00437A] to-[#0066B3] mb-4">
            Apa itu EduPath?
          </h1>
        </div>

        {/* Introduction Card */}
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-gray-200/50">
          <div className="text-gray-700 leading-relaxed space-y-4">
            <p className="text-justify text-sm sm:text-base">
              EduPath adalah platform digital yang membantu siswa SMA/SMK
              menemukan jurusan dan universitas yang sesuai dengan minat dan
              kemampuan mereka. Melalui fitur tes minat bakat, informasi kampus,
              dan konseling online, EduPath membantu siswa merencanakan masa
              depan pendidikan dengan lebih mudah dan terarah.
            </p>
            <p className="text-justify text-sm sm:text-base">
              Platform ini menyediakan tes minat dan bakat, kumpulan informasi
              jurusan dan universitas di Indonesia, serta layanan konseling
              online untuk membantu siswa memahami potensi dan menentukan arah
              pendidikan yang sesuai dengan cita-cita mereka.
            </p>
          </div>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center my-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4FC3F7]/20 to-[#00437A]/20 rounded-full blur-2xl"></div>
            <div className="relative bg-[#3975BF] rounded-full p-6 sm:p-8 shadow-2xl ring-4 ring-white ring-offset-4 ring-offset-blue-100/30">
              <img
                src={logo}
                alt="EduPath Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Vision Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00437A] to-[#4FC3F7] rounded-t-2xl"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#00437A] to-[#0066B3] rounded-xl shadow-md">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Visi EduPath
              </h2>
            </div>

            <p className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base">
              Menjadi platform pendidikan digital yang membantu siswa Indonesia
              mengenali potensi diri dan memilih jalur pendidikan yang sesuai
              untuk masa depan mereka.
            </p>
          </div>

          {/* Mission Card */}
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4FC3F7] to-[#00437A] rounded-t-2xl"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#4FC3F7] to-[#00B4D8] rounded-xl shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Misi EduPath
              </h2>
            </div>

            <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-[#00437A] font-bold mt-1">•</span>
                <span className="text-justify">
                  Menyediakan tes minat dan bakat yang akurat untuk mengenali
                  potensi diri siswa.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00437A] font-bold mt-1">•</span>
                <span className="text-justify">
                  Memberikan informasi tentang jurusan dan universitas
                  di Indonesia.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00437A] font-bold mt-1">•</span>
                <span className="text-justify">
                  Menyediakan layanan konseling profesional untuk bimbingan
                  karir dan pendidikan
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#00437A] to-[#0066B3] rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00437A] to-[#0066B3]">
                Tim Kami
              </h2>
            </div>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Tim pengembang EduPath yang berdedikasi untuk memberikan solusi
              terbaik dalam perencanaan pendidikan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#4FC3F7]/50"
              >
                {/* Decorative Avatar Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#377BC1] rounded-full shadow-xl flex items-center justify-center ring-4 ring-white ring-offset-2 ring-offset-blue-50 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl sm:text-4xl font-black text-white">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {member.name}
                  </h3>
                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full">
                    <p className="text-xs sm:text-sm font-semibold text-[#00437A]">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify mt-4">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-[#00437A] to-[#0066B3] rounded-2xl p-8 sm:p-10 shadow-2xl">
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
              "Langkah kecil hari ini menentukan besar masa depanmu nanti"
            </p>
            <p className="text-blue-100 text-sm sm:text-base">- Tim EduPath</p>
          </div>
        </div>
      </div>
    </ProfilePageLayout>
  );
}
