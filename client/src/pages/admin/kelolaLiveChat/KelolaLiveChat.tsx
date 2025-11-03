import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import TokenManager from "../../../utils/tokenManager";
import toast from "react-hot-toast";
import { triggerChatRefresh } from "../../../utils/notificationEvents";

interface ChatUser {
  user_id: string;
  firstname: string;
  lastname: string;
  kelas: number | null;
  lastMessage?: string;
  lastMessageTime?: string;
  room_id?: string;
  consultation_id?: string;
  consultation_date?: string;
  unreadCount?: number;
}

interface ChatHistory {
  consultation_id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  kelas: number | null;
  admin_name: string;
  topic: string;
  consultation_date: string;
  status: string;
  room_id?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  messageCount: number;
}

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean; // retained because backend still returns it, but not used for alignment
}

const KelolaLiveChat = () => {
  const [activeTab, setActiveTab] = useState<"live" | "history">("live"); // ✨ NEW: Tab state
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]); // ✨ NEW: Chat history state
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ChatHistory | null>(
    null
  ); // ✨ NEW
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const currentUserId = TokenManager.getUserData().userId || "";

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  // Check if consultation has started (current time >= consultation time)
  const isConsultationStarted = (consultationDate?: string): boolean => {
    if (!consultationDate) return false;

    const now = new Date();
    const consultationTime = new Date(consultationDate);

    return now >= consultationTime;
  };

  // Filter users to only show those with started consultations
  const availableChatUsers = chatUsers.filter((user) =>
    isConsultationStarted(user.consultation_date)
  );

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Polling for message updates when a user is selected
  useEffect(() => {
    if (selectedUser && selectedUser.room_id) {
      // Start polling for new messages every 3 seconds (reduced for better responsiveness)
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const token = TokenManager.getToken();
          const messagesResponse = await axios.get(
            `${API_URL}/api/chat/messages/${selectedUser.room_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (messagesResponse.data.success) {
            const newMessages = messagesResponse.data.data;
            // Only update if messages are different
            setChatMessages((prevMessages) => {
              if (
                JSON.stringify(prevMessages) !== JSON.stringify(newMessages)
              ) {
                return newMessages;
              }
              return prevMessages;
            });
          }
        } catch (error) {
          console.error("Error polling messages:", error);
          // Don't show toast for polling errors to avoid spam
        }
      }, 3000); // Poll every 3 seconds instead of 5
    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [selectedUser, API_URL]);

  // Fetch chat users (students who have accepted AND ACTIVE consultations)
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        // Fetch live chat users (active consultations)
        const response = await axios.get(`${API_URL}/api/chat/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setChatUsers(response.data.data);

        // ✨ NEW: Fetch chat history (inactive consultations)
        const historyResponse = await axios.get(`${API_URL}/api/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setChatHistory(historyResponse.data.data);
      } catch (error) {
        console.error("Error fetching chat users:", error);
        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            toast.error("Session expired. Silakan login ulang.");
            TokenManager.logout();
            window.location.href = "/login";
          } else {
            toast.error("Gagal mengambil data chat");
          }
        } else {
          toast.error("Gagal mengambil data chat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, [API_URL]);

  // Fetch chat messages for selected user
  const fetchChatMessages = async (userId: string) => {
    try {
      setMessagesLoading(true);
      const token = TokenManager.getToken();

      // First, find the user's consultation to get consultation_id
      const selectedUserData = chatUsers.find(
        (user) => user.user_id === userId
      );

      // Check if consultation has started
      if (
        selectedUserData &&
        !isConsultationStarted(selectedUserData.consultation_date)
      ) {
        const consultationTime = selectedUserData.consultation_date
          ? new Date(selectedUserData.consultation_date).toLocaleString(
              "id-ID",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )
          : "belum ditentukan";

        setChatMessages([
          {
            id: "waiting-1",
            message: `Chat belum dapat dimulai. Konseling dijadwalkan pada ${consultationTime}. Silakan tunggu hingga waktu konseling dimulai.`,
            senderId: "system",
            senderName: "Sistem",
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
          },
        ]);
        setMessagesLoading(false);
        return;
      }

      if (selectedUserData && selectedUserData.consultation_id) {
        // Get or create chat room first
        const roomResponse = await axios.get(
          `${API_URL}/api/chat/room/${selectedUserData.consultation_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (roomResponse.data.success) {
          const chatRoom = roomResponse.data.data;
          const roomId = chatRoom.room_id;

          // Now fetch messages from the chat room
          const messagesResponse = await axios.get(
            `${API_URL}/api/chat/messages/${roomId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (messagesResponse.data.success) {
            setChatMessages(messagesResponse.data.data);
          } else {
            setChatMessages([]);
          }
          setChatUsers((prev) =>
            prev.map((u) =>
              u.user_id === selectedUserData.user_id
                ? { ...u, unreadCount: 0 }
                : u
            )
          );

          // Update the selected user with room_id
          setSelectedUser((prev) =>
            prev ? { ...prev, room_id: roomId } : null
          );
        }
      } else {
        // If no consultation_id, show empty chat
        setChatMessages([
          {
            id: "welcome-1",
            message:
              "Halo! Saya admin EduPath. Chat room akan dibuat ketika ada konsultasi yang diterima.",
            senderId: "admin",
            senderName: "Admin EduPath",
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Gagal mengambil pesan chat");

      // Fallback to welcome message
      setChatMessages([
        {
          id: "error-1",
          message:
            "Maaf, terjadi kesalahan saat mengambil pesan chat. Silakan coba lagi.",
          senderId: "admin",
          senderName: "Admin EduPath",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        },
      ]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleUserSelect = (user: ChatUser) => {
    // Optimistic: set selectedUser & kosongkan unread (dot langsung hilang) sebelum fetch
    setSelectedUser(user);
    setChatUsers((prev) =>
      prev.map((u) =>
        u.user_id === user.user_id ? { ...u, unreadCount: 0 } : u
      )
    );
    fetchChatMessages(user.user_id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sendingMessage) return;

    setSendingMessage(true);
    const messageText = newMessage.trim();

    try {
      const token = TokenManager.getToken();

      // Make sure we have room_id in selectedUser
      if (!selectedUser.room_id && selectedUser.consultation_id) {
        // Try to get/create chat room first
        const roomResponse = await axios.get(
          `${API_URL}/api/chat/room/${selectedUser.consultation_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (roomResponse.data.success) {
          const roomId = roomResponse.data.data.room_id;
          setSelectedUser((prev) =>
            prev ? { ...prev, room_id: roomId } : null
          );
        } else {
          toast.error("Gagal membuat chat room");
          return;
        }
      }

      if (selectedUser.room_id) {
        // Optimistic update: Add message to UI immediately
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          message: messageText,
          senderId: currentUserId,
          senderName: "Admin EduPath",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        };

        // Add to messages immediately for better UX
        setChatMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage("");

        // Send message via API
        const response = await axios.post(
          `${API_URL}/api/chat/messages/${selectedUser.room_id}`,
          {
            message: messageText,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Replace optimistic message with real message from server
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id ? response.data.data : msg
            )
          );

          // Update last message in chat users list
          setChatUsers((prev) =>
            prev.map((user) =>
              user.user_id === selectedUser.user_id
                ? {
                    ...user,
                    lastMessage: messageText,
                    // Simpan dalam bentuk ISO agar formatter bisa bekerja dengan benar
                    lastMessageTime: new Date().toISOString(),
                  }
                : user
            )
          );

          // Trigger chat refresh for notification badge
          triggerChatRefresh();
        } else {
          // Remove optimistic message if sending failed
          setChatMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage.id)
          );
          setNewMessage(messageText); // Restore input
          toast.error("Gagal mengirim pesan");
        }
      } else {
        toast.error(
          "Chat room tidak ditemukan. Pastikan konsultasi sudah diterima."
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove optimistic message and restore input on error
      setChatMessages((prev) =>
        prev.filter((msg) => !msg.id.startsWith("temp-"))
      );
      setNewMessage(messageText);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Silakan login ulang.");
          TokenManager.logout();
          window.location.href = "/login";
        } else {
          toast.error(error.response?.data?.message || "Gagal mengirim pesan");
        }
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Placeholder: jika nanti ada realtime, panggil fungsi ini ketika pesan baru dari murid diterima.
  const handleIncomingMessageFromStudent = (
    roomId: string,
    message: ChatMessage
  ) => {
    // PENTING: Fungsi ini hanya boleh dipanggil untuk pesan dari STUDENT
    // Pastikan pesan bukan dari admin sebelum memproses unread
    if (message.isFromAdmin) {
      console.warn(
        "handleIncomingMessageFromStudent called with admin message, ignoring"
      );
      return;
    }

    // Jika bukan chat yang sedang dibuka, tambah unread
    if (!selectedUser || selectedUser.room_id !== roomId) {
      setChatUsers((prev) =>
        prev.map((u) =>
          u.room_id === roomId
            ? {
                ...u,
                unreadCount: (u.unreadCount || 0) + 1,
                lastMessage: message.message,
                lastMessageTime: new Date().toISOString(),
              }
            : u
        )
      );
    } else {
      // Sedang dibuka, langsung append ke messages
      setChatMessages((prev) => [...prev, message]);
      // Update last message display
      setChatUsers((prev) =>
        prev.map((u) =>
          u.room_id === roomId
            ? {
                ...u,
                lastMessage: message.message,
                lastMessageTime: new Date().toISOString(),
              }
            : u
        )
      );
    }
  };

  // NOTE: handleIncomingMessageFromStudent akan dipakai saat implementasi realtime (Socket.io)
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void handleIncomingMessageFromStudent; // hindari unused warning tanpa deklarasi variabel

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter users: only show those with started consultations + search term
  const filteredUsers = availableChatUsers.filter(
    (user) =>
      `${user.firstname} ${user.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.kelas && user.kelas.toString().includes(searchTerm))
  );

  const isValidDate = (d: Date) => !isNaN(d.getTime());

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (!isValidDate(date)) return "";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const messageDate = new Date(timestamp);
    if (!isValidDate(messageDate)) return ""; // Hindari Invalid Date
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} jam lalu`;

    // Jika lebih dari 1 hari, tampilkan tanggal (dd Mon)
    return messageDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Memuat data chat...</div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-120px)] rounded-lg shadow-lg flex">
      {/* Chat Users List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Live Chat</h2>
              <p className="text-sm text-gray-600">
                Murid dengan konseling ter-accept ({chatUsers.length})
              </p>
            </div>
            <MessageCircle className="text-blue-500" size={24} />
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm
                ? "Tidak ada siswa yang ditemukan"
                : chatUsers.length === 0
                ? "Tidak ada data siswa"
                : "Belum ada chat aktif"}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => handleUserSelect(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.user_id === user.user_id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                } ${
                  user.user_id === "US005"
                    ? "border-l-4 border-l-green-500"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.firstname.charAt(0)}
                      {user.lastname.charAt(0)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {user.firstname} {user.lastname}
                        {user.user_id === "US005" && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {user.user_id}
                          </span>
                        )}
                        {typeof user.unreadCount === "number" &&
                          user.unreadCount > 0 && (
                            <span
                              className="ml-2 inline-block w-3 h-3 rounded-full bg-red-500"
                              title="Pesan baru dari siswa"
                              aria-label="Pesan baru dari siswa"
                            />
                          )}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Kelas {user.kelas}
                      </p>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-400">
                          {formatLastMessageTime(user.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {user.consultation_date && (
                      <p className="text-xs text-gray-500 mt-1">
                        {isConsultationStarted(user.consultation_date) ? (
                          <span className="text-green-600 font-medium">
                            ● Konseling aktif
                          </span>
                        ) : (
                          <span className="text-orange-500">
                            ⏱ Dimulai:{" "}
                            {new Date(user.consultation_date).toLocaleString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        )}
                      </p>
                    )}
                    {user.lastMessage && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {user.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUser.firstname.charAt(0)}
                      {selectedUser.lastname.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {selectedUser.firstname} {selectedUser.lastname}
                      {selectedUser.user_id === "US005" && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          US005
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Kelas {selectedUser.kelas}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                chatMessages.map((message) => {
                  // Robust alignment logic: prioritize isFromAdmin flag for better reliability
                  const isMine =
                    message.isFromAdmin || message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isMine ? "order-2" : "order-1"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            isMine
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div
                          className={`flex items-center mt-1 text-xs text-gray-500 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: "40px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Pilih Chat untuk Memulai
              </h3>
              <p className="text-gray-500">
                Pilih siswa dari daftar untuk memulai percakapan
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaLiveChat;
