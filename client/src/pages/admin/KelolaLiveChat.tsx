import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  MessageCircle,
  Clock,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import axios from "axios";
import TokenManager from "../../utils/tokenManager";
import toast from "react-hot-toast";

interface ChatUser {
  user_id: string;
  firstname: string;
  lastname: string;
  kelas: number | null;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  room_id?: string;
}

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

const KelolaLiveChat = () => {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Fetch chat users (students who have accepted consultations)
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        // Use the new chat endpoint
        const response = await axios.get(`${API_URL}/api/chat/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setChatUsers(response.data.data);
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
      const token = TokenManager.getToken();
      
      // First, find the user's consultation to get room_id
      const selectedUserData = chatUsers.find(user => user.user_id === userId);
      
      if (selectedUserData && selectedUserData.room_id) {
        // Fetch messages from the chat room
        const response = await axios.get(
          `${API_URL}/api/chat/messages/${selectedUserData.room_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setChatMessages(response.data.data);
        }
      } else {
        // If no room_id, show empty chat or create default messages
        setChatMessages([
          {
            id: "1",
            message: "Halo! Saya Ibu Sarah, Guru BK di sekolah. Ada yang ingin kamu konsultasikan?",
            senderId: "BK001",
            senderName: "Ibu Sarah (BK001)",
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Gagal mengambil pesan chat");
      
      // Fallback to mock messages
      setChatMessages([
        {
          id: "1",
          message: "Halo! Saya Ibu Sarah, Guru BK di sekolah. Ada yang ingin kamu konsultasikan?",
          senderId: "BK001",
          senderName: "Ibu Sarah (BK001)",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        },
      ]);
    }
  };

  const handleUserSelect = (user: ChatUser) => {
    setSelectedUser(user);
    fetchChatMessages(user.user_id);

    // Mark messages as read
    setChatUsers((prev) =>
      prev.map((u) =>
        u.user_id === user.user_id ? { ...u, unreadCount: 0 } : u
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = TokenManager.getToken();
      const selectedUserData = chatUsers.find(user => user.user_id === selectedUser.user_id);
      
      if (selectedUserData && selectedUserData.room_id) {
        // Send message via API
        const response = await axios.post(
          `${API_URL}/api/chat/messages/${selectedUserData.room_id}`,
          {
            message: newMessage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          // Add the new message to the chat
          setChatMessages((prev) => [...prev, response.data.data]);
          setNewMessage("");

          // Update last message in chat users list
          setChatUsers((prev) =>
            prev.map((user) =>
              user.user_id === selectedUser.user_id
                ? {
                    ...user,
                    lastMessage: newMessage,
                    lastMessageTime: "Baru saja",
                  }
                : user
            )
          );
        }
      } else {
        // Fallback to local state if no room_id
        const bkMessage: ChatMessage = {
          id: Date.now().toString(),
          message: newMessage,
          senderId: "BK001",
          senderName: "Ibu Sarah (BK001)",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        };

        setChatMessages((prev) => [...prev, bkMessage]);
        setNewMessage("");

        // Update last message in chat users list
        setChatUsers((prev) =>
          prev.map((user) =>
            user.user_id === selectedUser.user_id
              ? {
                  ...user,
                  lastMessage: newMessage,
                  lastMessageTime: "Baru saja",
                }
              : user
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = chatUsers.filter(
    (user) =>
      `${user.firstname} ${user.lastname}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (user.kelas && user.kelas.toString().includes(searchTerm))
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getKelasText = (kelas: number | null) => {
    if (!kelas) return "Tidak diketahui";
    return kelas === 10
      ? "X"
      : kelas === 11
      ? "XI"
      : kelas === 12
      ? "XII"
      : kelas.toString();
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
                      </h3>
                      {user.unreadCount && user.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {user.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Kelas {getKelasText(user.kelas)}
                      </p>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-400">
                          {user.lastMessageTime}
                        </span>
                      )}
                    </div>
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
                      Kelas {getKelasText(selectedUser.kelas)}
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
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isFromAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.isFromAdmin ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        message.isFromAdmin
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.isFromAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Clock size={12} className="mr-1" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
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
