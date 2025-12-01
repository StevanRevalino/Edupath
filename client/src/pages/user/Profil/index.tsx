import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import ProfilePageLayout from "./components/ProfilePageLayout";
import ModalEditProfile from "./components/ModalEditProfile";

export interface User {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas?: number;
  created_at?: string;
  updated_at?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type UserProfile = User;

const Profil = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        navigate("/login");
        return;
      }

      const userData = await axios.get(
        `${API_URL}/api/users/${TokenManager.getUserData().userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUserProfile(userData.data.data);
      console.log("Profile data loaded:", userData.data.data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    fetchUserProfile(); // Refresh profile data after successful update
  };

  const getInitials = (user: UserProfile | null) => {
    if (!user) return "...";
    const f = (user.firstname || "").trim();
    const l = (user.lastname || "").trim();
    const a = f ? f[0] : "";
    const b = l ? l[0] : "";
    const initials = a + b || f.slice(0, 2) || "...";
    return initials.toUpperCase();
  };

  if (loading) {
    return <ProfilePageLayout showLoading={true} pageTitle="Profil" />;
  }

  return (
    <ProfilePageLayout isProfilePage={true} pageTitle="Profil">
      {userProfile && (
        <div className="relative space-y-8 p-4 max-w-7xl mx-auto">
          {/* Main Card Container with Gradient Border Effect */}
          <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-200/50 backdrop-blur-sm overflow-visible">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00437A]/5 to-transparent rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full blur-2xl -z-10"></div>

            {/* Header Section with Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
              {/* Left: Title and Button */}
              <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00437A] to-[#0066B3]">
                  Profil saya
                </h1>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-fit group relative bg-gradient-to-r from-[#4FC3F7] to-[#00B4D8] hover:from-[#39B5E8] hover:to-[#0096C7] text-white px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Ubah Profil
                  </span>
                </button>
              </div>

              {/* Right: Avatar Circle */}
              <div className="self-center sm:self-auto flex-shrink-0">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-[#00437A] to-[#0066B3] rounded-full shadow-2xl flex items-center justify-center ring-4 ring-white ring-offset-4 ring-offset-blue-50/50 transform hover:scale-105 transition-transform duration-300">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-black text-white drop-shadow-lg relative z-10">
                    {getInitials(userProfile)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Grid with Modern Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Identitas Section - Modern Card */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Gradient Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00437A] via-[#0066B3] to-[#4FC3F7] rounded-t-2xl"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#00437A] to-[#0066B3] rounded-xl shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Identitas</h2>
                </div>

                <div className="space-y-5">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Nama Lengkap
                    </label>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      {userProfile.firstname} {userProfile.lastname}
                    </p>
                  </div>

                  {userProfile.kelas !== null &&
                    userProfile.kelas !== undefined && (
                      <div className="transform transition-all duration-200 hover:translate-x-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Kelas
                        </label>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border border-blue-200">
                          <svg
                            className="w-5 h-5 text-primary-dark"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          <span className="text-xl font-bold text-primary-dark">
                            {userProfile.kelas}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Akun Section - Modern Card */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Gradient Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4FC3F7] via-[#0066B3] to-[#00437A] rounded-t-2xl"></div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#4FC3F7] to-[#00B4D8] rounded-xl shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Akun</h2>
                </div>

                <div className="space-y-5">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 py-3 rounded-xl border border-gray-200">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-base sm:text-lg text-gray-700 font-medium">
                        {userProfile.email.replace(
                          /^(.{2}).*(@.*)$/,
                          "$1*******$2"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 py-3 rounded-xl border border-gray-200">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                      <p className="text-base sm:text-lg text-gray-700 font-medium tracking-widest">
                        ••••••••••
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Edit Profile */}
          <ModalEditProfile
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={handleModalSuccess}
            currentData={{
              firstname: userProfile.firstname,
              lastname: userProfile.lastname,
              kelas: userProfile.kelas,
            }}
          />
        </div>
      )}
    </ProfilePageLayout>
  );
};

export default Profil;
