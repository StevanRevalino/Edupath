import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import ProfilePageLayout from "../../../components/ProfilePageLayout";

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

      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUserProfile(response.data.user);
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

  if (loading) {
    return <ProfilePageLayout showLoading={true} />;
  }

  return (
    <ProfilePageLayout isProfilePage={true}>
      {userProfile && (
        <>
          {/* Profile Header - Fixed horizontal alignment */}
          <div className="flex items-center mb-8 gap-2">
            <h1 className="text-3xl font-bold text-gray-800">Profil saya</h1>
            <button className="bg-[#D6F4FF] hover:bg-[#bde6ee] cursor-pointer border-[#00437A] border-3 text-[#00437A] px-5 py-1 rounded-full text-sm font-medium">
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

                  {userProfile.kelas && (
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
          </>
        )}
    </ProfilePageLayout>
  );
};

export default Profil;
