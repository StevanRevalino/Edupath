import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Clock,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isFromAdmin: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const UserLiveChat = ({ isOpen, onToggle }: ChatProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat history on component mount
  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      setUnreadCount(0);
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      // Connect US005 directly with BK001 - Mock conversation history
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          message:
            "Halo! Saya Ibu Sarah, Guru BK di sekolah. Ada yang ingin kamu konsultasikan?",
          senderId: "BK001",
          senderName: "Ibu Sarah (BK001)",
          timestamp: "2024-01-15T09:00:00Z",
          isFromAdmin: true,
        },
        {
          id: "2",
          message: "Halo Bu, saya butuh bantuan untuk memilih jurusan kuliah",
          senderId: "US005",
          senderName: "Saya",
          timestamp: "2024-01-15T09:02:00Z",
          isFromAdmin: false,
        },
        {
          id: "3",
          message:
            "Tentu! Saya senang bisa membantu. Sekarang kamu kelas berapa dan apa minat kamu?",
          senderId: "BK001",
          senderName: "Ibu Sarah (BK001)",
          timestamp: "2024-01-15T09:03:00Z",
          isFromAdmin: true,
        },
      ];

      setChatMessages(mockMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast.error("Gagal memuat riwayat chat");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      // US005 sending message to BK001
      const userId = "US005";

      // Create user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        message: newMessage,
        senderId: userId,
        senderName: "Saya",
        timestamp: new Date().toISOString(),
        isFromAdmin: false,
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      // Simulate BK001 response after 2-3 seconds
      setTimeout(() => {
        const bkResponses = [
          "Baik, saya mengerti. Dari hasil tes minat bakat yang sudah kamu kerjakan, ada beberapa rekomendasi yang cocok untuk kamu.",
          "Hmm, menarik. Bisa ceritakan lebih detail tentang mata pelajaran favorit kamu?",
          "Saya akan bantu kamu analisis kemampuan dan minat. Sudah pernah ikut tes minat bakat di aplikasi ini?",
          "Terima kasih sudah berbagi. Untuk jurusan yang kamu minati, ada beberapa universitas yang bisa jadi pilihan.",
          "Bagus! Saya akan berikan beberapa saran berdasarkan profil kamu.",
        ];

        const randomResponse =
          bkResponses[Math.floor(Math.random() * bkResponses.length)];

        const bkResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: randomResponse,
          senderId: "BK001",
          senderName: "Ibu Sarah (BK001)",
          timestamp: new Date().toISOString(),
          isFromAdmin: true,
        };

        setChatMessages((prev) => [...prev, bkResponse]);

        // Add unread count if chat is minimized
        if (isMinimized) {
          setUnreadCount((prev) => prev + 1);
        }
      }, 2000 + Math.random() * 1000); // 2-3 seconds delay

      toast.success("Pesan terkirim ke Ibu Sarah");
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? "h-16 w-80" : "h-96 w-80 sm:w-96"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageCircle size={20} />
            <div>
              <h3 className="font-semibold text-sm">Chat dengan Ibu Sarah</h3>
              <p className="text-xs opacity-90">
                {isConnected ? "Terhubung dengan BK001" : "Tidak terhubung"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {unreadCount > 0 && isMinimized && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
            <button
              onClick={handleMinimize}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onToggle}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Content - Only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isFromAdmin ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className={`max-w-[80%]`}>
                    <div
                      className={`p-2 rounded-lg text-sm ${
                        message.isFromAdmin
                          ? "bg-gray-200 text-gray-800"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <p>{message.message}</p>
                    </div>
                    <div
                      className={`flex items-center mt-1 text-xs text-gray-500 ${
                        message.isFromAdmin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <Clock size={10} className="mr-1" />
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan..."
                    rows={1}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    style={{ minHeight: "32px", maxHeight: "80px" }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserLiveChat;
