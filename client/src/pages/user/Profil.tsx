import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Mail, GraduationCap, Shield } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import TokenManager from "../../utils/tokenManager";

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
    // Gunakan TokenManager untuk clear semua data auth
    TokenManager.logout();
    toast.success("Berhasil logout");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="pt-16 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 px-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {userProfile && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="text-blue-600" size={20} />
              <div>
                <label className="text-sm text-gray-600">Nama Lengkap</label>
                <p className="font-medium text-gray-800">
                  {userProfile.firstname} {userProfile.lastname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="text-blue-600" size={20} />
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="font-medium text-gray-800">{userProfile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="text-blue-600" size={20} />
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <p className="font-medium text-gray-800">{userProfile.role}</p>
              </div>
            </div>

            {userProfile.kelas && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <GraduationCap className="text-blue-600" size={20} />
                <div>
                  <label className="text-sm text-gray-600">Kelas</label>
                  <p className="font-medium text-gray-800">
                    Kelas {userProfile.kelas}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <User className="text-blue-600" size={20} />
              <div>
                <label className="text-sm text-gray-600">User ID</label>
                <p className="font-medium text-gray-800">
                  {userProfile.user_id}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;
