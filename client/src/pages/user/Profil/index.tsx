import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import ProfilePageLayout from "./components/ProfilePageLayout";
import ModalEditProfile from "./components/ModalEditProfile";

interface UserProfile {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas?: number;
}

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

      const { userId } = TokenManager.getUserData();
      const API_URL =
        (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Response dari /api/users/{id} menggunakan structure { data: { user data } }
      setUserProfile(response.data.data);
      console.log("Profile data loaded:", response.data.data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);

      // Handle specific axios error responses
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Token expired. Silakan login kembali.");
        handleLogout();
        return;
      }

      toast.error("Gagal mengambil data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    TokenManager.logout();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  const handleModalSuccess = () => {
    fetchUserProfile(); // Refresh profile data after successful update
  };

  if (loading) {
    return <ProfilePageLayout showLoading={true} pageTitle="Profil" />;
  }

  return (
    <ProfilePageLayout isProfilePage={true} pageTitle="Profil">
      {userProfile && (
        <>
          {/* Profile Header - Fixed horizontal alignment */}
          <div className="flex items-center mb-8 gap-2">
            <h1 className="text-3xl font-bold text-gray-800">Profil saya</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#D6F4FF] hover:bg-[#bde6ee] cursor-pointer border-[#00437A] border-3 text-[#00437A] px-5 py-1 rounded-full text-sm font-medium"
            >
              Ubah
            </button>
          </div>

          <div className="space-y-8 pl-10">
            {/* Identitas Section */}
            <div>
              <div className="flex justify-start mb-5">
                <div className="border-3 border-[#00437A] text-[#00437A] px-5 py-1 rounded-full text-sm font-semibold">
                  Identitas
                </div>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Nama lengkap
                  </label>
                  <p className="text-2xl font-bold text-gray-800">
                    {userProfile.firstname} {userProfile.lastname}
                  </p>
                </div>

                {userProfile.kelas !== null &&
                  userProfile.kelas !== undefined && (
                    <div>
                      <label className="block text-gray-600 text-sm mb-2">
                        Kelas
                      </label>
                      <p className="text-2xl font-bold text-gray-800">
                        {userProfile.kelas}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Akun Section */}
            <div>
              <div className="flex justify-start mb-5 pt-2">
                <button className="border-3 border-[#00437A] text-[#00437A] px-5 py-1 rounded-full text-sm font-medium bg-white">
                  Akun
                </button>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Email
                  </label>
                  <p className="text-lg text-gray-800">
                    {userProfile.email.replace(
                      /^(.{2}).*(@.*)$/,
                      "$1*******$2"
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-600 text-sm mb-2">
                    Password
                  </label>
                  <p className="text-lg text-gray-800">••••••••••</p>
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
        </>
      )}
    </ProfilePageLayout>
  );
};

export default Profil;
