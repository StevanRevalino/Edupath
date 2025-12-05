import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  setActiveTab?: (tab: string) => void;
  setConsultationInitialTab?: (
    tab: "pending" | "active" | "completed" | "declined"
  ) => void;
  setSelectedChatUserId?: (userId: string) => void;
}

interface DashboardStats {
  totalStudents: number;
  totalConsultations: number;
  pendingConsultations: number;
  activeConsultations: number;
  completedConsultations: number;
  totalScholarships: number;
  totalChats: number;
  unreadChats: number;
}

interface UpcomingConsultation {
  consultation_id: string;
  murid_name: string;
  topic: string;
  consultation_date: string;
  status: string;
}

interface RecentChat {
  room_id: string;
  user_id: string;
  murid_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  setConsultationInitialTab,
  setSelectedChatUserId,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalConsultations: 0,
    pendingConsultations: 0,
    activeConsultations: 0,
    completedConsultations: 0,
    totalScholarships: 0,
    totalChats: 0,
    unreadChats: 0,
  });
  const [upcomingConsultations, setUpcomingConsultations] = useState<
    UpcomingConsultation[]
  >([]);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Chart data states
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, -1 = last week, 1 = next week
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());

  // Get week range for display
  const getWeekRange = () => {
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(start.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });
    };

    return `${formatDate(start)} - ${formatDate(end)} ${start.getFullYear()}`;
  };

  // Navigate to different week
  const navigateWeek = (direction: number) => {
    const newWeek = selectedWeek + direction;
    setSelectedWeek(newWeek);

    // Calculate new week start date (Monday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    monday.setDate(monday.getDate() + newWeek * 7);
    setWeekStartDate(monday);
  };

  // Fetch weekly consultation data
  const fetchWeeklyData = async () => {
    try {
      const start = new Date(weekStartDate);
      const end = new Date(weekStartDate);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const token = TokenManager.getToken();
      const response = await axios.get(
        `${API_URL}/api/admin/dashboard/weekly-consultations`,
        {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        setWeeklyData(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
      }
      console.error("Error fetching weekly data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh dashboard data every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    fetchWeeklyData();
  }, [weekStartDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = TokenManager.getToken();
      const authHeader = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      // Fetch all data in parallel for faster loading
      const [statsResponse, consultationsResponse, chatsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/admin/dashboard/stats`, authHeader),
          axios.get(
            `${API_URL}/api/admin/dashboard/upcoming-consultations`,
            authHeader
          ),
          axios.get(`${API_URL}/api/admin/dashboard/recent-chats`, authHeader),
        ]);

      if (statsResponse.data.success) {
        const dashboardData = statsResponse.data.data;
        setStats(dashboardData.stats);

        // Set chart data
        if (dashboardData.weeklyConsultations) {
          setWeeklyData(dashboardData.weeklyConsultations.data);
        }
      }
      if (consultationsResponse.data.success) {
        setUpcomingConsultations(consultationsResponse.data.data);
      }
      if (chatsResponse.data.success) {
        setRecentChats(chatsResponse.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          TokenManager.logout();
          window.location.href = "/login";
        }
      }
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const weeklyConsultationsData = {
    labels: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    datasets: [
      {
        label: "Konsultasi",
        data: weeklyData,
        backgroundColor: "#6CCBFF",
        borderWidth: 0.5,
      },
    ],
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const indonesiaTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    );
    const consultationStart = new Date(dateString);
    const consultationEnd = new Date(
      consultationStart.getTime() + 60 * 60 * 1000
    ); // +1 hour

    // Check if currently ongoing
    if (indonesiaTime >= consultationStart && indonesiaTime < consultationEnd) {
      return "Sedang Berlangsung";
    }

    // Calculate time until start
    const diffMs = consultationStart.getTime() - indonesiaTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      return "Sudah Selesai";
    } else if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)} hari lagi`;
    } else if (diffHours > 0) {
      return `${diffHours} jam ${diffMins} menit lagi`;
    } else if (diffMins > 0) {
      return `${diffMins} menit lagi`;
    } else {
      return "Segera dimulai";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang! Berikut ringkasan aktivitas EduPath
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Students */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-90 text-sm font-medium">
                Total Murid
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
              <p className="text-white opacity-75 text-xs mt-2">
                Terdaftar aktif
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pending Consultations */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Konseling Pending
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.pendingConsultations}
              </h3>
              <p className="text-yellow-100 text-xs mt-2">Perlu persetujuan</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Active Consultations */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">
                Konseling Aktif
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.activeConsultations}
              </h3>
              <p className="text-green-100 text-xs mt-2">Sedang berlangsung</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Unread Chats */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Pesan Baru</p>
              <h3 className="text-3xl font-bold mt-2">{stats.unreadChats}</h3>
              <p className="text-purple-100 text-xs mt-2">
                dari {stats.totalChats} chat
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Larger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Consultations Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Konsultasi Mingguan
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Previous week"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  {getWeekRange()}
                </span>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Next week"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <Bar
              data={weeklyConsultationsData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>

          {/* Upcoming Consultations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Jadwal Konseling Mendatang ({upcomingConsultations.length})
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {upcomingConsultations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Tidak ada jadwal konseling mendatang</p>
                </div>
              ) : (
                upcomingConsultations.map((consultation) => (
                  <div
                    key={consultation.consultation_id}
                    className="flex items-start gap-4 p-4 bg-secondary-light border border-secondary rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (setActiveTab) {
                        if (setConsultationInitialTab) {
                          setConsultationInitialTab("active");
                        }
                        setActiveTab("kelola-data-konseling");
                      }
                    }}
                  >
                    <div className="bg-primary text-white p-3 rounded-lg flex-shrink-0">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {
                            formatDate(consultation.consultation_date).split(
                              " "
                            )[0]
                          }
                        </div>
                        <div className="text-xs">
                          {
                            formatDate(consultation.consultation_date).split(
                              " "
                            )[1]
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {consultation.murid_name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {consultation.topic}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-primary font-medium">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatTime(consultation.consultation_date)}
                        </span>
                        <span className="text-orange-600 font-medium">
                          {getTimeUntil(consultation.consultation_date)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        {consultation.status === "ACCEPTED"
                          ? "Diterima"
                          : consultation.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Smaller */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Kalender
            </h3>
            <div className="space-y-4">
              {/* Month/Year Selector */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-primary-dark" />
                </button>
                <h3 className="font-semibold text-gray-800">
                  {selectedDate.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-primary-dark" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Days of Week */}
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Calendar Days */}
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const days = [];

                  // Empty cells for days before month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(
                      <div key={`empty-${i}`} className="aspect-square"></div>
                    );
                  }

                  // Days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    const isSelected =
                      date.toDateString() === selectedDate.toDateString();

                    // Check if there are consultations on this date
                    const consultationsOnDate = upcomingConsultations.filter(
                      (consultation) => {
                        const consultationDate = new Date(
                          consultation.consultation_date
                        );
                        return (
                          consultationDate.toDateString() ===
                          date.toDateString()
                        );
                      }
                    );
                    const hasConsultation = consultationsOnDate.length > 0;

                    days.push(
                      <button
                        key={day}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative ${
                          isSelected
                            ? "bg-primary-dark text-white font-semibold"
                            : isToday
                            ? "bg-secondary-light text-primary-dark font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                        title={
                          hasConsultation
                            ? `${consultationsOnDate.length} konseling`
                            : undefined
                        }
                      >
                        <span>{day}</span>
                        {hasConsultation && (
                          <div className="flex gap-0.5 mt-0.5">
                            {consultationsOnDate.slice(0, 3).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected ? "bg-white" : "bg-primary"
                                }`}
                              ></div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  }

                  return days;
                })()}
              </div>

              {/* Calendar Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-secondary-light rounded"></div>
                  <span>Hari ini</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                  </div>
                  <span>Ada konseling</span>
                </div>
              </div>

              {/* Selected Date Display */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Tanggal Dipilih:</p>
                <p className="text-lg font-semibold text-primary-dark">
                  {selectedDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                {/* Consultations on Selected Date */}
                {(() => {
                  const consultationsOnSelectedDate =
                    upcomingConsultations.filter((consultation) => {
                      const consultationDate = new Date(
                        consultation.consultation_date
                      );
                      return (
                        consultationDate.toDateString() ===
                        selectedDate.toDateString()
                      );
                    });

                  if (consultationsOnSelectedDate.length > 0) {
                    return (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase">
                          Jadwal Hari Ini ({consultationsOnSelectedDate.length})
                        </p>
                        {consultationsOnSelectedDate.map((consultation) => (
                          <div
                            key={consultation.consultation_id}
                            className="bg-secondary-lighter border-l-4 border-primary-dark p-2 rounded"
                          >
                            <p className="text-xs font-semibold text-gray-900">
                              {consultation.murid_name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {consultation.topic}
                            </p>
                            <p className="text-xs text-primary-dark font-medium mt-1">
                              {formatTime(consultation.consultation_date)}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        Tidak ada jadwal konseling
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Recent Chats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Chat Terbaru
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentChats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Belum ada chat</p>
                </div>
              ) : (
                recentChats.map((chat) => (
                  <div
                    key={chat.room_id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      if (setSelectedChatUserId && setActiveTab) {
                        setSelectedChatUserId(chat.user_id);
                        setActiveTab("kelola-live-chat");
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {chat.murid_name}
                          </h4>
                          {chat.unread_count > 0 && (
                            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {chat.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate max-w-[300px]">
                          {chat.last_message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(chat.last_message_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
