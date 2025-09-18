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
  isOnline?: boolean;
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

  // Fetch chat users (students who have sent messages or all students)
  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        setLoading(true);
        const token = TokenManager.getToken();

        // For now, fetch all students - in real implementation,
        // this would fetch students with chat history
        const response = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Filter only students (role = 'USER') and prioritize US005
        const students = response.data.data
          .filter((user: any) => user.role === "USER")
          .map((user: any) => {
            // Special handling for US005 - active chat with BK001
            if (user.user_id === "US005") {
              return {
                user_id: user.user_id,
                firstname: user.firstname,
                lastname: user.lastname,
                kelas: user.kelas,
                lastMessage: "Halo Bu, saya butuh bantuan untuk memilih jurusan kuliah",
                lastMessageTime: "Baru saja",
                unreadCount: 1,
                isOnline: true,
              };
            }
            // Other students with mock data
            const index = students?.length || 0;
            return {
              user_id: user.user_id,
              firstname: user.firstname,
              lastname: user.lastname,
              kelas: user.kelas,
              lastMessage:
                index % 3 === 0
                  ? "Halo Bu, ada yang ingin saya tanyakan"
                  : index % 3 === 1
                  ? "Terima kasih Bu atas sarannya"
                  : undefined,
              lastMessageTime:
                index % 3 === 0
                  ? "2 jam lalu"
                  : index % 3 === 1
                  ? "Kemarin"
                  : undefined,
              unreadCount: index % 5 === 0 ? 1 : 0,
              isOnline: Math.random() > 0.6,
            };
          })
          .sort((a: any, b: any) => {
            // Sort US005 to the top
            if (a.user_id === "US005") return -1;
            if (b.user_id === "US005") return 1;
            return 0;
          });

        setChatUsers(students);
      } catch (error) {
        console.error("Error fetching chat users:", error);
        toast.error("Gagal mengambil data chat");
      } finally {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, [API_URL]);

  // Fetch chat messages for selected user
  const fetchChatMessages = async (userId: string) => {
    try {
      let mockMessages: ChatMessage[] = [];

      // Special conversation history for US005 with BK001
      if (userId === "US005") {
        mockMessages = [
          {
            id: "1",
            message: "Halo! Saya Ibu Sarah, Guru BK di sekolah. Ada yang ingin kamu konsultasikan?",
            senderId: "BK001",
            senderName: "Ibu Sarah (BK001)",
            timestamp: "2024-01-15T09:00:00Z",
            isFromAdmin: true,
          },
          {
            id: "2",
            message: "Halo Bu, saya butuh bantuan untuk memilih jurusan kuliah",
            senderId: userId,
            senderName: selectedUser
              ? `${selectedUser.firstname} ${selectedUser.lastname}`
              : "Student",
            timestamp: "2024-01-15T09:02:00Z",
            isFromAdmin: false,
          },
          {
            id: "3",
            message: "Tentu! Saya senang bisa membantu. Sekarang kamu kelas berapa dan apa minat kamu?",
            senderId: "BK001",
            senderName: "Ibu Sarah (BK001)",
            timestamp: "2024-01-15T09:03:00Z",
            isFromAdmin: true,
          },
          {
            id: "4",
            message: "Saya kelas 12 Bu, suka matematika dan komputer. Tapi masih bingung antara teknik informatika atau sistem informasi",
            senderId: userId,
            senderName: selectedUser
              ? `${selectedUser.firstname} ${selectedUser.lastname}`
              : "Student",
            timestamp: "2024-01-15T09:05:00Z",
            isFromAdmin: false,
          },
        ];
      } else {
        // Default conversation for other students
        mockMessages = [
          {
            id: "1",
            message: "Halo Bu, ada yang ingin saya tanyakan",
            senderId: userId,
            senderName: selectedUser
              ? `${selectedUser.firstname} ${selectedUser.lastname}`
              : "Student",
            timestamp: "2024-01-15T09:30:00Z",
            isFromAdmin: false,
          },
          {
            id: "2",
            message: "Halo! Tentu, saya Ibu Sarah. Ada yang bisa saya bantu?",
            senderId: "BK001",
            senderName: "Ibu Sarah (BK001)",
            timestamp: "2024-01-15T09:32:00Z",
            isFromAdmin: true,
          },
        ];
      }

      setChatMessages(mockMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast.error("Gagal mengambil pesan chat");
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
      // BK001 (Ibu Sarah) sending message to student
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

      // Show specific message for US005
      const toastMessage = selectedUser.user_id === "US005" 
        ? "Pesan terkirim ke US005" 
        : "Pesan terkirim";
      
      toast.success(toastMessage);
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
            <h2 className="text-xl font-bold text-gray-800">Live Chat</h2>
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
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
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
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
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
                      Kelas {getKelasText(selectedUser.kelas)} •{" "}
                      {selectedUser.isOnline ? "Online" : "Offline"}
                      {selectedUser.user_id === "US005" && (
                        <span className="ml-2 text-blue-600">• Chat Aktif dengan BK001</span>
                      )}
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
              <div className="flex items-end space-x-2">
                <div className="flex-1">
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
