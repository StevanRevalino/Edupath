import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  BookOpen,
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
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
  murid_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const AdminDashboard = () => {
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
  const [monthlyConsultations, setMonthlyConsultations] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);
  const [monthlyActiveStudents, setMonthlyActiveStudents] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);
  const [monthLabels, setMonthLabels] = useState<string[]>([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
  ]);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = TokenManager.getToken();

      // Fetch dashboard statistics
      const statsResponse = await axios.get(
        `${API_URL}/api/admin/dashboard/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch upcoming consultations
      const consultationsResponse = await axios.get(
        `${API_URL}/api/admin/dashboard/upcoming-consultations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch recent chats
      const chatsResponse = await axios.get(
        `${API_URL}/api/admin/dashboard/recent-chats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statsResponse.data.success) {
        const dashboardData = statsResponse.data.data;
        setStats(dashboardData.stats);

        // Set chart data
        if (dashboardData.weeklyConsultations) {
          setWeeklyData(dashboardData.weeklyConsultations.data);
        }
        if (dashboardData.monthlyTrends) {
          setMonthLabels(dashboardData.monthlyTrends.labels);
          setMonthlyConsultations(dashboardData.monthlyTrends.consultations);
          setMonthlyActiveStudents(dashboardData.monthlyTrends.activeStudents);
        }
      }
      if (consultationsResponse.data.success) {
        setUpcomingConsultations(consultationsResponse.data.data);
      }
      if (chatsResponse.data.success) {
        setRecentChats(chatsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Use dummy data for now
      setStats({
        totalStudents: 45,
        totalConsultations: 128,
        pendingConsultations: 5,
        activeConsultations: 12,
        completedConsultations: 98,
        totalScholarships: 23,
        totalChats: 34,
        unreadChats: 7,
      });
      setUpcomingConsultations([
        {
          consultation_id: "CONS001",
          murid_name: "Ahmad Rizki",
          topic: "Konsultasi Pemilihan Jurusan",
          consultation_date: new Date(
            Date.now() + 2 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACCEPTED",
        },
        {
          consultation_id: "CONS002",
          murid_name: "Siti Nurhaliza",
          topic: "Info Beasiswa",
          consultation_date: new Date(
            Date.now() + 5 * 60 * 60 * 1000
          ).toISOString(),
          status: "ACCEPTED",
        },
      ]);
      setRecentChats([
        {
          room_id: "ROOM001",
          murid_name: "Budi Santoso",
          last_message: "Terima kasih atas bantuannya pak/bu",
          last_message_time: new Date(
            Date.now() - 10 * 60 * 1000
          ).toISOString(),
          unread_count: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Chart data
  const consultationStatusData = {
    labels: ["Pending", "Active", "Completed", "Declined"],
    datasets: [
      {
        data: [
          stats.pendingConsultations,
          stats.activeConsultations,
          stats.completedConsultations,
          stats.totalConsultations -
            stats.pendingConsultations -
            stats.activeConsultations -
            stats.completedConsultations,
        ],
        backgroundColor: ["#FCD34D", "#3B82F6", "#10B981", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const weeklyConsultationsData = {
    labels: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
    datasets: [
      {
        label: "Konsultasi",
        data: weeklyData,
        backgroundColor: "#6CCBFF",
        borderColor: "#00437A",
        borderWidth: 1,
      },
    ],
  };

  const monthlyTrendData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Konsultasi",
        data: monthlyConsultations,
        borderColor: "#00437A",
        backgroundColor: "rgba(108, 203, 255, 0.1)",
        tension: 0.4,
      },
      {
        label: "Murid Aktif",
        data: monthlyActiveStudents,
        borderColor: "#6CCBFF",
        backgroundColor: "rgba(0, 67, 122, 0.1)",
        tension: 0.4,
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
    const target = new Date(dateString);
    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
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
    <div className="max-h-[calc(100vh-64px)] p-4 sm:p-6 overflow-y-auto">
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
              <p className="text-blue-100 text-sm font-medium">Total Murid</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
              <p className="text-blue-100 text-xs mt-2">Terdaftar aktif</p>
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
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Consultations */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Konsultasi Minggu Ini
              </h3>
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

            {/* Consultation Status */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Status Konseling
              </h3>
              <Doughnut
                data={consultationStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { padding: 15, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Tren 6 Bulan Terakhir
            </h3>
            <Line
              data={monthlyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: "top" },
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
              <Clock className="w-5 h-5 text-blue-600" />
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
                    className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="bg-blue-600 text-white p-3 rounded-lg flex-shrink-0">
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
                        <span className="text-blue-600 font-medium">
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
              <Clock className="w-5 h-5 text-blue-600" />
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
                  <ChevronLeft className="w-5 h-5 text-[#00437A]" />
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
                  <ChevronRight className="w-5 h-5 text-[#00437A]" />
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
                            ? "bg-[#00437A] text-white font-semibold"
                            : isToday
                            ? "bg-blue-100 text-[#00437A] font-semibold"
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
                                  isSelected ? "bg-white" : "bg-[#6CCBFF]"
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
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>Hari ini</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-[#6CCBFF] rounded-full"></div>
                    <div className="w-1 h-1 bg-[#6CCBFF] rounded-full"></div>
                  </div>
                  <span>Ada konseling</span>
                </div>
              </div>

              {/* Selected Date Display */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Tanggal Dipilih:</p>
                <p className="text-lg font-semibold text-[#00437A]">
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
                            className="bg-blue-50 border-l-4 border-[#00437A] p-2 rounded"
                          >
                            <p className="text-xs font-semibold text-gray-900">
                              {consultation.murid_name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {consultation.topic}
                            </p>
                            <p className="text-xs text-[#00437A] font-medium mt-1">
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
              <MessageSquare className="w-5 h-5 text-blue-600" />
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
                        <p className="text-xs text-gray-600 mt-1 truncate">
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

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Statistik Cepat
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Total Murid
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalStudents}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Konseling Selesai
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.completedConsultations}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Data Beasiswa
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats.totalScholarships}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
